# PipelineOS — Mini CRM Dashboard

A dark, premium CRM dashboard for managing sales deals and pipeline. Built with React, TypeScript, and Vite as a full portfolio-grade web application.

## Live Demo
[View on Vercel →](https://pipeline-os.vercel.app)

## Screenshots
> Dashboard view with pipeline stats and charts
> Deals list with filters and sort

## Features

### Dashboard
- Pipeline value, revenue won, conversion rate, avg deal size
- Pipeline bar chart broken down by stage
- Top 5 deals by value

### Deals
- Add, edit, delete deals with confirmation
- Search by company or contact name
- Filter by stage (Lead → Won/Lost) and priority
- Sort by value, date added, or company name A–Z
- Delete confirmation to prevent accidents

### General
- `localStorage` persistence — data survives page refresh
- 8 seed deals preloaded for demo purposes
- Responsive layout — mobile sidebar with burger menu
- TypeScript throughout — fully typed

## Tech Stack
- React 18
- TypeScript
- Vite
- Lucide React (icons)
- localStorage (persistence)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Deploy to Vercel

```bash
npm run build   # verify build passes locally first
```

1. Push to GitHub
2. Import repo on [vercel.com](https://vercel.com)
3. Framework: **Vite** (auto-detected)
4. Click Deploy ✅

No environment variables needed.

## Project Structure

```
crm-app/
  src/
    App.tsx           — Main application component
    main.tsx          — Entry point
    index.css         — Global styles + responsive CSS
    hooks/
      useDeals.ts     — Deal state + localStorage logic
    types/
      index.ts        — TypeScript types
  index.html
  package.json
  vite.config.ts
  tsconfig.json
```

---
Built by Nikita Danilov · [Portfolio](https://github.com/niki-deone)
