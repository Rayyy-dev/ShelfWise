# ShelfWise - Smart Library Management System

A modern, full-stack library management system built with Next.js, Express, and Prisma. Features a beautiful glass morphism UI design with deep indigo color scheme.

## Features

- **Book Catalog Management** - Add, view, and manage books with individual copy tracking
- **Member Management** - Track library members with auto-generated member numbers
- **Borrowing System** - Check out and return books with barcode scanning support
- **Dashboard Analytics** - Real-time statistics and recent activity overview
- **Modern UI/UX** - Glass morphism design with smooth animations

## Tech Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT-based authentication with role-based access control

## Project Structure

```
shelfwise/
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # Express backend
├── packages/
│   └── database/     # Prisma schema and client
└── package.json      # Monorepo root
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/shelfwise.git
cd shelfwise
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database:
```bash
npm run db:generate
npm run db:push
npm run db:seed
```

4. Start the development servers:
```bash
# Start API server (port 3001)
npm run dev:api

# In another terminal, start web app (port 3000)
npm run dev:web
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev:web` | Start Next.js development server |
| `npm run dev:api` | Start Express API server |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:seed` | Seed database with sample data |
| `npm run db:studio` | Open Prisma Studio |

## Environment Variables

Copy `.env.example` to set up your environment:

```bash
cp .env.example .env.local
```

Required variables:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `PORT` - API server port (default: 3001)
- `FRONTEND_URL` - Frontend URL for CORS (default: http://localhost:3000)
- `NEXT_PUBLIC_API_URL` - API URL for frontend (default: http://localhost:3001)

## Pushing to GitHub

1. Create a new repository on GitHub

2. Initialize git (if not already):
```bash
git init
```

3. Add all files:
```bash
git add .
```

4. Commit your changes:
```bash
git commit -m "Initial commit - ShelfWise library management system"
```

5. Add remote origin:
```bash
git remote add origin https://github.com/YOUR_USERNAME/shelfwise.git
```

6. Push to GitHub:
```bash
git branch -M main
git push -u origin main
```

## Screenshots

The application features a modern glass morphism design with:
- Gradient sidebar with animated navigation
- Glass-effect cards and modals
- Smooth hover animations
- Responsive layout for all screen sizes
  
<img width="1914" height="910" alt="Screenshot 2025-12-07 025915" src="https://github.com/user-attachments/assets/98a21a41-b5b8-4c2c-8602-6e9083899e58" />

<img width="1919" height="904" alt="Screenshot 2025-12-07 025930" src="https://github.com/user-attachments/assets/a99908ce-0385-4472-9391-9a4211719b38" />

<img width="1915" height="907" alt="Screenshot 2025-12-07 030001" src="https://github.com/user-attachments/assets/b14f2a37-42af-4933-b975-300883247550" />

## License

MIT

---

Built with care by ShelfWise Team
