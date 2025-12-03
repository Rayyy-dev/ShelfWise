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
- **Database**: SQLite with Prisma ORM
- **Authentication**: JWT-based admin authentication

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

### Demo Credentials

- **Email**: admin@library.com
- **Password**: admin123

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

Create `.env` file in `packages/database/`:

```env
DATABASE_URL="file:./dev.db"
```

Create `.env` file in `apps/api/`:

```env
JWT_SECRET="your-secret-key"
PORT=3001
```

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

## License

MIT

---

Built with care by ShelfWise Team
