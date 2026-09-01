/* RI Legal Group — scroll engine and progressive enhancement.
   The page works with this file removed: nav links are anchors, the form is a
   real form, headings are plain text, and no content is gated behind motion. */

(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer  = window.matchMedia('(pointer: fine)').matches;

  /* ---------------------------------------------------------------- Year */

  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------------------------------------------------------- Mobile nav */

  var toggle = document.getElementById('navToggle');
  var nav = document.getElementById('primaryNav');
  var header = document.querySelector('.site-header');

  function closeNav() {
    if (!toggle || !nav) return;
    nav.removeAttribute('data-open');
    if (header) header.removeAttribute('data-menu');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      if (nav.getAttribute('data-open') === 'true') {
        closeNav();
      } else {
        nav.setAttribute('data-open', 'true');
        /* The open panel needs the solid bar even at the top of the page. */
        if (header) header.setAttribute('data-menu', 'open');
        toggle.setAttribute('aria-expanded', 'true');
        toggle.setAttribute('aria-label', 'Close menu');
      }
    });

    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeNav();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape' || nav.getAttribute('data-open') !== 'true') return;
      closeNav();
      toggle.focus();
    });
  }

  /* ------------------------------------------------- Split headings into
     word masks. Walks child nodes so inline accents survive the split. */

  function splitWords(root) {
    var nodes = Array.prototype.slice.call(root.childNodes);

    nodes.forEach(function (node) {
      if (node.nodeType === 3) {
        var words = node.nodeValue.split(/(\s+)/);
        var frag = document.createDocumentFragment();

        words.forEach(function (word) {
          if (!word.trim()) {
            frag.appendChild(document.createTextNode(word));
            return;
          }
          var outer = document.createElement('span');
          var inner = document.createElement('span');
          outer.className = 'w';
          inner.className = 'w__i';
          inner.textContent = word;
          outer.appendChild(inner);
          frag.appendChild(outer);
        });

        node.parentNode.replaceChild(frag, node);
      } else if (node.nodeType === 1) {
        splitWords(node);
      }
    });
  }

  var splitTargets = Array.prototype.slice.call(document.querySelectorAll('[data-split]'));

  if (!reduceMotion) {
    splitTargets.forEach(function (el) {
      splitWords(el);
      Array.prototype.forEach.call(el.querySelectorAll('.w__i'), function (inner, i) {
        inner.style.setProperty('--d', (i * 55) + 'ms');
      });
    });
  }

  /* ------------------------------------------------------------- Reveals */

  var revealables = Array.prototype.slice.call(
    document.querySelectorAll('[data-reveal], [data-split], [data-line]')
  );

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealables.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    /* Siblings inside one group come in one after another rather than together. */
    var groups = {};
    revealables.forEach(function (el) {
      var parent = el.parentNode;
      if (!el.hasAttribute('data-reveal')) return;
      var key = groups[parent] || (groups[parent] = []);
      key.push(el);
      el.style.setProperty('--d', ((key.length - 1) * 90) + 'ms');
    });

    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });

    revealables.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ------------------------------------------- Scroll engine: header state,
     progress hairline, hero drift, and image drift. One listener, one frame. */

  var progress = document.querySelector('.progress');
  var heroMedia = document.querySelector('.hero__media');
  var hero = document.querySelector('.hero');
  var drifters = Array.prototype.slice.call(document.querySelectorAll('.frame__inner'));

  var rafId = 0;

  function update() {
    var y = window.scrollY || window.pageYOffset;
    var vh = window.innerHeight;

    if (header) header.setAttribute('data-scrolled', y > 8 ? 'true' : 'false');

    if (progress) {
      var max = document.documentElement.scrollHeight - vh;
      progress.style.transform = 'scaleX(' + (max > 0 ? Math.min(y / max, 1) : 0) + ')';
    }

    if (!reduceMotion) {
      /* The hero footage trails the page by about a quarter. Overscan on
         .hero__media means the frame never runs out of picture. */
      /* The editorial build frames its film inside the page rather than behind
         it, and opts out here; its video drifts as a .frame__inner instead. */
      if (heroMedia && hero && heroMedia.getAttribute('data-parallax') !== 'off'
          && y < hero.offsetHeight) {
        heroMedia.style.transform = 'translate3d(0,' + (y * 0.26).toFixed(2) + 'px,0)';
      }

      drifters.forEach(function (el) {
        var frame = el.parentNode;
        var rect = frame.getBoundingClientRect();
        if (rect.bottom < -200 || rect.top > vh + 200) return;

        /* -1 leaving the top, +1 arriving from the bottom. */
        var p = ((rect.top + rect.height / 2) - vh / 2) / ((vh + rect.height) / 2);
        p = Math.max(-1, Math.min(1, p));
        el.style.transform = 'translate3d(0,' + (p * 7).toFixed(2) + '%,0)';
      });
    }
  }

  function onScroll() {
    if (rafId) return;
    rafId = window.requestAnimationFrame(function () {
      rafId = 0;
      update();
    });
  }

  update();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  /* Frames are suspended while the page is hidden, so a queued callback never
     runs and the flag would latch on forever. Clear it on the way back. */
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) return;
    if (rafId) window.cancelAnimationFrame(rafId);
    rafId = 0;
    update();
  });

  /* -------------------------------------------- Current section in the nav */

  var sections = document.querySelectorAll('main section[id]');
  var navLinks = {};
  Array.prototype.forEach.call(document.querySelectorAll('.nav__link'), function (link) {
    navLinks[link.getAttribute('href')] = link;
  });

  if (sections.length && 'IntersectionObserver' in window) {
    var inView = [];

    var paintCurrent = function () {
      Object.keys(navLinks).forEach(function (key) {
        navLinks[key].removeAttribute('aria-current');
      });
      /* Sections overlap at the observer margins. Highest one on the page wins,
         so exactly one nav item is ever marked. */
      var current = null;
      Array.prototype.forEach.call(sections, function (section) {
        if (!current && inView.indexOf(section.id) !== -1) current = section.id;
      });
      if (current && navLinks['#' + current]) {
        navLinks['#' + current].setAttribute('aria-current', 'true');
      }
    };

    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var at = inView.indexOf(entry.target.id);
        if (entry.isIntersecting && at === -1) inView.push(entry.target.id);
        if (!entry.isIntersecting && at !== -1) inView.splice(at, 1);
      });
      paintCurrent();
    }, { rootMargin: '-45% 0px -50% 0px' });

    Array.prototype.forEach.call(sections, function (s) { sectionObserver.observe(s); });
  }

  /* ------------------------------------------------------ Magnetic buttons */

  if (finePointer && !reduceMotion && document.body.getAttribute('data-magnetic') !== 'off') {
    Array.prototype.forEach.call(document.querySelectorAll('.btn'), function (btn) {
      btn.addEventListener('pointerenter', function () {
        btn.style.transition = 'transform 160ms cubic-bezier(0.16,1,0.3,1), color 240ms, border-color 240ms';
      });
      btn.addEventListener('pointermove', function (e) {
        var r = btn.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2);
        var dy = e.clientY - (r.top + r.height / 2);
        btn.style.transform = 'translate(' + (dx * 0.16).toFixed(1) + 'px,' + (dy * 0.28).toFixed(1) + 'px)';
      });
      btn.addEventListener('pointerleave', function () {
        btn.style.transition = '';
        btn.style.transform = '';
      });
    });
  }

  /* -------------------------------------------------- Hero background video */

  /* Three clips play in sequence and crossfade. Only the first ships a src in
     the HTML; the next is attached once the current starts playing, so nothing
     but the visible clip costs bandwidth up front. */

  var heroVideos = Array.prototype.slice.call(document.querySelectorAll('[data-hero-video]'));

  if (heroVideos.length) {
    var saveData = !!(navigator.connection && navigator.connection.saveData);

    if (reduceMotion || saveData) {
      heroVideos.forEach(function (v) { v.removeAttribute('data-src'); });
    } else {
      var current = 0;
      var swapping = false;
      var heroInView = true;
      var CROSSFADE = 1.1;

      var attach = function (video) {
        var src = video.getAttribute('data-src');
        if (!src) return;
        video.removeAttribute('data-src');
        video.src = src;
        video.load();
      };

      var play = function (video) {
        var attempt = video.play();
        if (attempt && attempt.catch) {
          attempt.catch(function () {
            /* Autoplay refused. The poster stays up and the hero still reads. */
          });
        }
      };

      var advance = function () {
        if (swapping || heroVideos.length < 2) return;
        swapping = true;

        var outgoing = heroVideos[current];
        current = (current + 1) % heroVideos.length;
        var incoming = heroVideos[current];

        attach(incoming);
        incoming.currentTime = 0;
        play(incoming);
        incoming.classList.add('is-active');
        outgoing.classList.remove('is-active');

        attach(heroVideos[(current + 1) % heroVideos.length]);

        window.setTimeout(function () {
          outgoing.pause();
          outgoing.currentTime = 0;
          swapping = false;
        }, 1050);
      };

      heroVideos.forEach(function (video) {
        video.addEventListener('timeupdate', function () {
          if (video !== heroVideos[current] || !video.duration) return;
          if (video.duration - video.currentTime <= CROSSFADE) advance();
        });
        video.addEventListener('ended', function () {
          if (video === heroVideos[current]) advance();
        });
      });

      play(heroVideos[0]);
      attach(heroVideos[1]);

      document.addEventListener('visibilitychange', function () {
        if (!document.hidden && heroInView) play(heroVideos[current]);
      });

      if ('IntersectionObserver' in window && hero) {
        var heroObserver = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            heroInView = entry.isIntersecting;
            if (heroInView) play(heroVideos[current]);
            else heroVideos.forEach(function (v) { v.pause(); });
          });
        }, { threshold: 0.01 });
        heroObserver.observe(hero);
      }
    }
  }

  /* ------------------------------------------------------------ Contact form */

  var form = document.getElementById('consultForm');
  if (!form) return;

  var status = document.getElementById('formStatus');
  var statusText = document.getElementById('formStatusText');
  var submitBtn = document.getElementById('submitBtn');
  var fields = Array.prototype.slice.call(
    form.querySelectorAll('input[required], select[required], textarea[required]')
  );

  function wrapperOf(el) { return el.closest('.field'); }

  function validate(el) {
    var value = (el.value || '').trim();
    var ok = value !== '';

    if (ok && el.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
    if (ok && el.id === 'details') ok = value.length >= 10;

    var wrapper = wrapperOf(el);
    if (wrapper) wrapper.setAttribute('data-invalid', ok ? 'false' : 'true');
    el.setAttribute('aria-invalid', ok ? 'false' : 'true');
    return ok;
  }

  /* Validate on blur, never on keystroke. Once a field is marked invalid,
     clear the message as soon as the visitor fixes it. */
  fields.forEach(function (el) {
    el.addEventListener('blur', function () { validate(el); });
    ['input', 'change'].forEach(function (evt) {
      el.addEventListener(evt, function () {
        var wrapper = wrapperOf(el);
        if (wrapper && wrapper.getAttribute('data-invalid') === 'true') validate(el);
      });
    });
  });

  function showStatus(state, message) {
    if (!status || !statusText) return;
    status.setAttribute('data-state', state);
    statusText.textContent = message;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var firstInvalid = null;
    fields.forEach(function (el) {
      if (!validate(el) && !firstInvalid) firstInvalid = el;
    });

    if (firstInvalid) {
      showStatus('error', 'Check the highlighted fields and send it again.');
      firstInvalid.focus();
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="btn__spinner" aria-hidden="true"></span> Sending';

    var restore = function () {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Request a consultation';
    };

    fetch('/api/intake', {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: new FormData(form)
    })
      .then(function (res) {
        if (!res.ok) throw new Error('http ' + res.status);
        return res.json();
      })
      .then(function () {
        restore();
        form.reset();
        fields.forEach(function (el) {
          var wrapper = wrapperOf(el);
          if (wrapper) wrapper.removeAttribute('data-invalid');
          el.removeAttribute('aria-invalid');
        });
        showStatus('success', 'Request sent. We reply within one business day.');
        if (status) status.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
      })
      .catch(function () {
        /* Never claim it was received when it was not. Hand over the direct
           routes instead, so the enquiry is not simply lost. */
        restore();
        showStatus(
          'error',
          'That did not send. Please call (424) 512-4414 or email russel@rilegalgroup.com and we will pick it up from there.'
        );
        if (status) status.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
      });
  });
})();
