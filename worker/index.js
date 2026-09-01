/**
 * RI Legal Group — site worker.
 *
 * Serves the static site and handles one endpoint: POST /api/intake, which
 * emails the consultation request to the firm.
 *
 * The recipient is hard-coded rather than taken from the request. It is a
 * verified destination address on the Cloudflare account, which is what keeps
 * sending free, and it means a crafted request cannot turn this into an open
 * relay.
 */

const TO = 'russel@rilegalgroup.com';
const FROM = { email: 'intake@rilegalgroup.com', name: 'RI Legal Group website' };

const MATTERS = [
  'Residential purchase or sale',
  'Commercial purchase or sale',
  'Commercial lease',
  'Land use or zoning',
  'Estate planning',
  'Probate or trust administration',
  'Not sure yet',
];

const LIMITS = { name: 120, email: 254, phone: 40, details: 5000 };

const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });

/** Keep anything a visitor typed out of the HTML email. */
const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
  );

function validate(form) {
  /* Only accept string values. A client can post a File for a text field,
     and .toString() on that yields junk rather than failing. */
  const get = (k) => {
    const v = form.get(k);
    return typeof v === 'string' ? v.trim() : '';
  };
  const name = get('name');
  const email = get('email');
  const phone = get('phone');
  const matter = get('matter');
  const details = get('details');

  const errors = [];
  if (!name) errors.push('name');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errors.push('email');
  if (!MATTERS.includes(matter)) errors.push('matter');
  if (details.length < 10) errors.push('details');

  for (const [field, max] of Object.entries(LIMITS)) {
    const value = get(field);
    if (value.length > max) errors.push(field);
  }

  return { errors, name, email, phone, matter, details };
}

async function handleIntake(request, env) {
  if (request.method !== 'POST') return json(405, { error: 'method_not_allowed' });

  let form;
  try {
    form = await request.formData();
  } catch {
    return json(400, { error: 'bad_request' });
  }

  /* Honeypot. Real people never see this field, so anything in it is a bot.
     Answer 200 so the bot believes it succeeded and does not retry. */
  /* Only a field that is present AND filled means a bot. A missing field must
     fall through: an extension or a stale cached page could strip it, and
     silently binning a real enquiry is the failure this whole change exists
     to prevent. */
  const hp = form.get('company');
  if (typeof hp === 'string' && hp.trim() !== '') {
    return json(200, { ok: true });
  }

  const { errors, name, email, phone, matter, details } = validate(form);
  if (errors.length) return json(422, { error: 'invalid', fields: errors });

  const received = new Date().toISOString();
  const rows = [
    ['Name', name],
    ['Email', email],
    ['Phone', phone || '—'],
    ['Matter', matter],
    ['Received', received],
  ];

  const text =
    rows.map(([k, v]) => `${k}: ${v}`).join('\n') + `\n\n${details}\n`;

  const html = `<table style="border-collapse:collapse;font:14px -apple-system,Segoe UI,sans-serif">
${rows
  .map(
    ([k, v]) =>
      `<tr><td style="padding:4px 16px 4px 0;color:#6E6B64">${k}</td><td style="padding:4px 0"><strong>${esc(
        v
      )}</strong></td></tr>`
  )
  .join('\n')}
</table>
<p style="font:14px/1.6 -apple-system,Segoe UI,sans-serif;white-space:pre-wrap;margin-top:20px">${esc(
    details
  )}</p>`;

  try {
    await env.EMAIL.send({
      to: TO,
      from: FROM,
      replyTo: email, // replying in the mail client goes straight to the enquirer
      subject: `Consultation request — ${name} — ${matter}`,
      text,
      html,
    });
  } catch (err) {
    console.error('intake send failed', err?.message || err);
    return json(502, { error: 'send_failed' });
  }

  return json(200, { ok: true });
}

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    if (pathname === '/api/intake') return handleIntake(request, env);
    return env.ASSETS.fetch(request);
  },
};
