# Snippet Studio

Snippet Studio is a modern snippet manager built with Next.js and Firebase. Capture reusable code, shell commands, and notes in a personal workspace with autosave, rich search, and Google authentication.

## Features

- **Google sign-in** – authenticate securely with your Google account
- **Intuitive workspace** – compose new snippets, filter with instant search, and manage your library in one view
- **Autosave editing** – update snippets in a full-screen editor with live status feedback


### Tech Stack

- [Next.js 14](https://nextjs.org/) with the App Router
- [React 18](https://react.dev/)
- [Firebase Web SDK](https://firebase.google.com/docs/web/setup) (Authentication + Firestore)
- CSS Modules for component styling


### Prerequisites

- Node.js 18 or later
- npm 9 or later
- A Firebase project with Google authentication enabled and a Firestore database

### Environment configuration

Create a `.env.local` file in the project root (you can copy `.env.example`) and add your Firebase credentials:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id # optional
```

Update `firebaseConfig.js` if your project uses a different configuration shape.

On Vercel, configure the same keys under **Project Settings → Environment Variables**. Redeploy after any changes so the new values are available at build time.

### Installation

```bash
npm install
```

### Develop

```bash
npm run dev
```

Visit `http://localhost:3000` to access the application. The dev server supports hot reloading, so changes will appear immediately.

### Code quality

```bash
npm run lint
```

The lint script uses Next.js built-in ESLint configuration.
