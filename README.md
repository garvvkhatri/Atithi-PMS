# Atithi-PMS
Modern offline-first Guest House / Hotel Management Desktop Application for Indian properties.
Stack
React, Tailwind CSS, shadcn-style UI components, Framer Motion
Node.js, Express.js
SQLite with Prisma ORM
Electron desktop packaging
Setup
cp .env.example .env
npm run setup
npm run dev
The dev app starts:

React renderer: http://127.0.0.1:5173
Local API: http://localhost:4100
Electron desktop shell
npm run setup installs dependencies, generates Prisma Client, initializes the SQLite schema, and seeds only starter user roles. Rooms, bookings, guests, and expenses start empty so the property can enter real data from day one.

Production Build
npm run dist
Artifacts are written to release/ for macOS and Windows targets.

Offline Data
SQLite lives at prisma/dev.db in development. In the packaged Electron app, the runtime database is created in Electron's writable user data directory. The Backup screen copies the active database file to a local backups folder and can restore from a selected backup path.

Included PMS Modules
Dashboard with room status, revenue, pending payment, expense, profit, and trend cards
Floor-wise visual room rack with room create/delete controls and Available, Occupied, Reserved, Cleaning, and Maintenance states
Booking creation with stay-duration and payment calculations plus double-booking prevention
Function/group bookings for weddings, birthday stays, family events, and group room holds
Printable booking receipts and checkout bills
Expense management, analytics, user roles, dark/light mode, and local backup/restore
