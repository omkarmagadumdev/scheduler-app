# Scheduler App

A full-stack scheduling platform inspired by Calendly, built with modern web technologies for speed, scalability, and a clean user experience.
Scheduler App enables users to publish availability, share a unique booking link, and manage meetings with reliable double-booking protection.

## 🚀 Live Demo

**Try it here:** https://scheduler-app-alpha.vercel.app/

---

## 📌 Features

- Create availability slots with date, start time, and end time
- Unique public booking URL for each user at /book/[username]
- Visitor-facing booking page with visible open slots
- Booking flow with double-booking prevention
- Dashboard to view and manage all bookings
- Responsive, mobile-friendly UI using Tailwind CSS

---

## ⚡ Tech Stack

### Frontend
- Next.js (App Router)
- React
- Tailwind CSS

### Backend
- Supabase REST API

### Database
- Supabase PostgreSQL
- Core tables: availability, bookings

---

## Architecture Overview

Scheduler App uses a modern full-stack architecture:

- Next.js handles server-rendered and client-rendered UI with route-based pages
- Supabase provides REST endpoints and persistent storage
- Availability data is created by users
- Public booking pages query available slots by username
- Booking creation validates slot availability before inserting records to prevent conflicts
- Dashboard reads booking history for each user in a structured view

High-level flow:
1. User creates availability
2. User shares public booking link
3. Visitor selects an open slot and books
4. System validates and stores booking
5. User reviews bookings on dashboard

---

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/your-username/scheduler-app.git
cd scheduler-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root and add the required values (see example below).

### 4. Run development server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

### 5. Build for production (optional)

```bash
npm run build
npm start
```

---

## Environment Variables

Example `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Notes:
- Use project-specific Supabase credentials
- Keep sensitive values out of version control

---

## Folder Structure

```text
scheduler-app/
├── app/
│   ├── book/[username]/page.tsx
│   ├── dashboard/page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   └── supabase.ts
├── public/
├── next.config.ts
├── package.json
└── README.md
```

---

## Screenshots

Add product screenshots here to improve project presentation:

- Home Page (placeholder)
- Availability Management (placeholder)
- Public Booking Page (placeholder)
- Dashboard Bookings View (placeholder)

Suggested paths:
- public/screenshots/home.png
- public/screenshots/availability.png
- public/screenshots/booking-page.png
- public/screenshots/dashboard.png

---

## Future Enhancements

- Calendar integrations (Google Calendar, Outlook)
- Email confirmations and reminders
- Time zone auto-detection and conversion
- Team scheduling and round-robin assignment
- Booking cancellation and rescheduling
- Admin analytics dashboard

---

## Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch
3. Commit your changes with clear messages
4. Push to your branch
5. Open a Pull Request with a concise description

Please keep changes focused, tested, and documented where relevant.

---
