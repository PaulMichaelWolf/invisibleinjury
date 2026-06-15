# invisibleinjury

## Email Magic Link Setup

Magic-link email is sent through Supabase Auth. The website does not store a
Resend API key and does not call the Resend API directly.

Before testing production email delivery, confirm:

- Resend domain verified.
- Resend DNS records added in Cloudflare.
- Supabase custom SMTP enabled.
- Supabase sender email set to `no-reply@invisibleincident.com`.
- Supabase Auth redirect URLs include local and production URLs.
  - Local testing should include `http://localhost:5500/profile.html` or the exact port currently serving the site.
  - Production should include `https://invisibleincident.com/profile.html`.
- Supabase Auth rate limits adjusted after custom SMTP is enabled.
