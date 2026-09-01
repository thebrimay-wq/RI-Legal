# rilegalgroup.com — DNS migration to Cloudflare
Captured from live DNS before any change.

## RECREATE IN CLOUDFLARE (email + verification). Get these right or mail breaks.
All must be "DNS only" (grey cloud), NOT proxied.

MX   @                  priority 1    aspmx.l.google.com
MX   @                  priority 5    alt1.aspmx.l.google.com
MX   @                  priority 5    alt2.aspmx.l.google.com
MX   @                  priority 10   alt3.aspmx.l.google.com
MX   @                  priority 10   alt4.aspmx.l.google.com
TXT  @                                v=spf1 include:_spf.google.com ~all
CNAME emafs7puygne                    gv-2io7afyxw6bh4u.dv.googlehosted.com

TXT  google._domainkey               (full value below, one line, no spaces)
v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0LZbFhwp/H82Zw9fPVJh8kwiQZXlPz9+uOQisTOtbRDSA8jbSs4+WY/aEs9GtI6qAtndpQhSJi+cxmfSa5Q3VVcQOzuG1QzxJugf4sgcdKsyRYvcnBxHge/KXXRMIzV169imRIO8OOnWFD/XyPj5c0v/G3LZzkhRc8FcuX2t/vggl48rCMtM7RkGQVM+RACw6PFAruewhBEKP+OR6G9StWcSfsUCXQRfWXLgATfbUV7uwXa5HjhgFJbmDGoBBFb1XDn2eGWLBiZisLIH+yP12YTEVojFQYFsbhcgWJmP/LQD7E/Km9+yFV5LsyhdEjU+ToguBmvo+ngN4shIoWEPFQIDAQAB

## DO NOT RECREATE (Squarespace-only; the site moves to Cloudflare)
A     @    198.185.159.144
A     @    198.185.159.145
A     @    198.49.23.144
A     @    198.49.23.145
CNAME www  ext-sq.squarespace.com
HTTPS @    alpn="h2,http/1.1" ipv4hint=...
CNAME _domainconnect  _domainconnect.domains.squarespace.com

## ADD
TXT  _dmarc   v=DMARC1; p=none; rua=mailto:russel@rilegalgroup.com
     (none exists today; you are about to start sending from this domain)

Apex + www come from attaching the Worker as a custom domain — do not hand-write them.
Cloudflare Email Sending adds its own cf-bounce records during onboarding.
