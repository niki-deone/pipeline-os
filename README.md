# PipelineOS — Deal Ledger

A mini CRM for tracking sales deals, designed as a paper ledger: ink on paper, banker's green, monospaced figures, deal stages rendered as stamps.

**Live demo:** https://pipeline-os-eight.vercel.app

## Features

**Dashboard**
- Pipeline value, revenue won, conversion rate, average deal size
- Pipeline breakdown by stage with value bars
- Top 5 deals by value

**Deals**
- Add, edit, delete deals (with inline delete confirmation)
- Search by company or contact
- Filter by stage (Lead → Won/Lost) and priority
- Sort by value, date added, or company name

**General**
- `localStorage` persistence — data survives refresh
- Seed deals preloaded for demo purposes
- Responsive layout down to mobile
- TypeScript throughout

## Tech stack

React 18 · TypeScript · Vite · Lucide icons · CSS custom properties (no UI framework)

## Getting started

```
npm install
npm run dev
```

Open http://localhost:5173

## Build

```
npm run build
```

---

Built by Nikita Danilov · [GitHub](https://github.com/niki-deone)
