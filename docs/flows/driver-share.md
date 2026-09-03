# Flow — Deliver the DeCA to the driver (F9, R-12)

Trigger: from the result page or `/app/deca/[id]`, "Enviar al conductor".

1. System shows channels: copy link, WhatsApp, email, print.
2. User picks one:
   - Copy link → the current version's public URL to clipboard.
   - WhatsApp → opens `https://wa.me/?text=<encoded: short message + URL>`.
   - Email → `POST /api/share` (rate-limited) sends a templated message with the URL; no user free-text in the envelope.
   - Print → print-optimised A4 view with the QR prominent; browser print dialog.
3. System emits `deca_shared` (channel).

Rules / failure paths:
- Always shares the CURRENT version's URL (after a correction, the new one).
- Email send fails → user told; link still copyable.
- Document outside the availability window → share disabled with an explanation.
