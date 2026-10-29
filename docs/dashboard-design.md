# Portfolio Analytics Studio

The dashboard uses the portfolio's navy/cream/blue palette, Instrument Serif headings, Inter Tight body text, JetBrains Mono labels, original personal mark, and glass navigation. Fonts and logo are served locally. Mobile layout collapses cards and tables; all actions have keyboard focus styles and respect reduced motion.

## Privacy and data integrity

The existing PBKDF2 (600,000 SHA-256 iterations), AES-GCM decryption, encrypted snapshot path, workflow, password and server secrets are unchanged. Password input is cleared after unlocking. Locking clears rendered tables, chart and metrics. No tracking, external fonts, storage or cookies are added. Snapshot fetch remains no-store; only HTTPS permits unlock. Tables use DOM text nodes, not HTML from analytics dimensions.

The upstream payload sums daily active users rather than reporting unique users across the whole period. The UI labels that total **Aktive Nutzertage** and explains that repeat users may count on multiple days. It does not claim a unique audience count. All three chart metrics read the existing daily data; no fabricated trends, percentages or live counters are shown. The actual generation timestamp is displayed in Europe/Berlin.

## Verification

Check desktop and 390px mobile, real password unlock, chart metric buttons, lock/re-unlock, and privacy in the locked state. Do not publish plaintext test payloads or credentials. Snapshot workflow remains on its existing six-hour schedule.
