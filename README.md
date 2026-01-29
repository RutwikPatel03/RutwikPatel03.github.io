# Rutwik Patel - Portfolio

My personal portfolio website built with Next.js, TypeScript, and Tailwind CSS.

**Live:** [rutwik.dev](https://rutwik.dev)

## Features

- Responsive design that works on all devices
- Dark and light mode with system preference detection
- Typing animation on the hero section
- Global visitor counter using Upstash Redis
- One-click email copy button
- AI chat assistant powered by Groq
- Contact form with email notifications via Resend
- Smooth page transitions with Framer Motion

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion
- Upstash Redis
- Resend
- Groq API
- Vercel

## Getting Started

Make sure you have Node.js 18+ installed.

Clone the repo and install dependencies:

```bash
git clone https://github.com/RutwikPatel03/RutwikPatel03.github.io.git
cd RutwikPatel03.github.io
npm install
```

Create a `.env.local` file in the root directory:

```env
GROQ_API_KEY=your_groq_api_key
RESEND_API_KEY=your_resend_api_key
CONTACT_EMAIL=your_email@example.com
KV_REST_API_URL=your_upstash_redis_url
KV_REST_API_TOKEN=your_upstash_redis_token
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## Project Structure

```
src/
├── app/            # Pages and API routes
├── components/     # React components
├── constants/      # Site config and data
├── hooks/          # Custom hooks
├── lib/            # Utilities
└── styles/         # Global styles
```

## Scripts

- `npm run dev` - Start dev server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run linter
- `npm run type-check` - Check TypeScript types

## License

MIT

## Contact

Feel free to reach out at rutwikpatel1313@gmail.com
