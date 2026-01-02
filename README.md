# ShelfWise

Library management system for tracking books, members, and borrowings.

**Live Demo:** [shelf-wise-web.vercel.app](https://shelf-wise-web.vercel.app) | **API:** [shelfwise-940k.onrender.com](https://shelfwise-940k.onrender.com)

---

## Features

- Book inventory with copy tracking
- Member registration and management
- Checkout/return with barcode support
- Fines tracking
- Reports (CSV & PDF export)

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 14, Tailwind CSS |
| Backend | Express.js, Node.js |
| Database | PostgreSQL, Prisma |
| Auth | JWT |

---

## Project Structure

```
shelfwise/
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # Express backend
└── packages/
    └── database/     # Prisma schema
```

---

## Getting Started

```bash
# Install dependencies
npm install

# Setup database
npm run db:generate
npm run db:push

# Run dev servers (two terminals)
npm run dev:api    # localhost:3001
npm run dev:web    # localhost:3000
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev:web` | Start frontend |
| `npm run dev:api` | Start API |
| `npm run db:studio` | Prisma Studio |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to DB |

---

## License

MIT
