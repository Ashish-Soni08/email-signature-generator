# Email Signature Generator

A minimal, professional email signature generator with live preview and one-click copy functionality.

**Live Demo:** [https://v0-email-signature-generator-seven.vercel.app/](https://v0-email-signature-generator-seven.vercel.app/)

---

## Features

- **Live Preview** — See your signature update in real-time as you type
- **Light/Dark Mode** — Preview how your signature looks in both modes
- **Multiple Logo Options**
  - Choose from preset logos (Vercel)
  - Upload your own image (with validation)
  - Create a custom text-based logo with colors and shapes
- **One-Click Copy** — Copy signature as HTML with inline styles for maximum email client compatibility
- **Import Guide** — Step-by-step instructions for Gmail, macOS Mail, and iOS Mail
- **Form Validation** — Required field checks, logo dimension/size validation, and helpful error messages
- **Fully Responsive** — Works great on mobile devices

---

## Signature Output

The generated HTML signature includes:
- Company logo (optional, links to your website)
- Name in bold
- Title and company name
- Phone and Twitter/X handle (separated by bullet if both exist)

All styles are inline for maximum compatibility across email clients.

---

## Tech Stack

- Next.js 14 (App Router)
- React 18
- Tailwind CSS
- TypeScript

---

## Getting Started

```bash
# Clone the repository
git clone <repo-url>

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

---

## License

MIT

<p align="center">
  <img src="/public/built-with-v0.jpg" alt="Built with v0" width="300" />
</p>
