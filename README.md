# Rutwik Patel - Portfolio Website

A modern, responsive portfolio website built with Next.js 14, TypeScript, and Tailwind CSS.

🌐 **Live Site:** [rutwikpatel.com](https://rutwikpatel.com)

## ✨ Features

- **Responsive Design** - Optimized for all screen sizes
- **Dark/Light Mode** - Theme toggle with system preference detection
- **Typing Animation** - Dynamic hero section with typewriter effect
- **Global Visitor Counter** - Real-time visitor tracking using Upstash Redis
- **Copy Email Button** - One-click email copy with animated feedback
- **AI Chat** - Interactive AI assistant powered by Groq
- **Contact Form** - Email integration with Resend
- **Smooth Animations** - Framer Motion powered transitions
- **SEO Optimized** - Meta tags and Open Graph support

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Database:** Upstash Redis (visitor counter)
- **Email:** Resend
- **AI:** Groq API
- **Deployment:** Vercel

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/RutwikPatel03/RutwikPatel03.github.io.git
   cd RutwikPatel03.github.io
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file with the following variables:
   ```env
   # Groq API Key for AI Chat
   GROQ_API_KEY=your_groq_api_key

   # Resend API Key for Contact Form
   RESEND_API_KEY=your_resend_api_key

   # Email to receive contact form submissions
   CONTACT_EMAIL=your_email@example.com

   # Upstash Redis (for visitor counter)
   KV_REST_API_URL=your_upstash_redis_url
   KV_REST_API_TOKEN=your_upstash_redis_token
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── api/            # API routes (chat, contact, stats)
│   └── ...
├── components/
│   ├── layout/         # Header, Footer
│   ├── sections/       # Hero, About, Experience, Projects, etc.
│   └── ui/             # Reusable UI components
├── constants/          # Site configuration and data
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and clients
└── styles/             # Global styles
```

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run type-check` | Run TypeScript compiler check |

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 📬 Contact

- **Email:** rutwikpatel1313@gmail.com
- **LinkedIn:** [linkedin.com/in/rutwikpatel13](https://linkedin.com/in/rutwikpatel13)
- **GitHub:** [github.com/RutwikPatel13](https://github.com/RutwikPatel13)
