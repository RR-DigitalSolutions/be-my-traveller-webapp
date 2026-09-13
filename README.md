# 🏔️ Be My Traveller — Luxury Experiential Travel & Custom Tour Platform

[![Next.js](https://img.shields.io/badge/Next.js-15.x-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Media-3448C5?style=flat-square&logo=cloudinary)](https://cloudinary.com/)
[![License](https://img.shields.io/badge/License-Proprietary-amber?style=flat-square)](LICENSE)

An enterprise-grade full-stack travel platform built with **Next.js (App Router)**, **MongoDB / Mongoose**, **NextAuth v5**, and **Tailwind CSS**. Features a customer-facing portal for bespoke holiday bookings, 3-tier luxury mountain packages, point-to-point fleet transfers, and a comprehensive Admin CMS & CRM Command Center.

---

## 🌟 Key Platform Modules

### 1. 🧳 Customer Travel Experience
- **Curated Multi-Tier Packages**: Handpicked Himachal, Kashmir, Uttarakhand, Ladakh, and Dubai tour packages with 3 dynamic luxury tiers (*Deluxe, Super Deluxe, Luxury*) with real-time hotel and price switches.
- **Mountain Transfers Fleet**: Point-to-point airport, intercity cabs, snow-chain 4x4 SUVs, luxury Volvo buses, and catamaran island ferries.
- **Interactive Trip Customizer**: Bespoke quote generator for personalized group holidays, honeymoons, and corporate getaways.
- **Dynamic Sessional Pricing Engine**: Automated off-season and peak-season date range multiplier rules.

### 2. 🛡️ Executive Admin CMS & CRM Command Center
- **Staff Privileges & RBAC (`/admin/users`)**: 4 primary department presets (*Admin & Executive, Company Management, Sales Executives, Support & Content*) with granular 12 section-by-section permission controls.
- **Platform Settings (`/admin/settings`)**: Unified control center for Company legal credentials, SMTP email delivery, WhatsApp Cloud API automation, Razorpay / Stripe gateways, and SEO tracking pixels (*GA4, GTM, Meta Pixel*).
- **Tour Packages Management (`/admin/packages`)**: Comprehensive catalog management with seasonal surcharge presets, tiered hotel allocations, and itinerary builders.
- **Products & Transfers (`/admin/products/transfers`)**: Fleet inventory, route matrix, driver allowances, and per-vehicle / per-passenger pricing models.
- **Sales & CRM Pipeline (`/admin/leads`, `/admin/quotes`)**: Lead tracking, automated WhatsApp quotes dispatch, and booking lifecycle management.

---

## 🏗️ Architecture & Technology Stack

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/) with React Server Components & Server Actions.
- **Database**: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) with [Mongoose ODM](https://mongoosejs.com/).
- **Authentication**: [NextAuth.js (Auth.js v5)](https://authjs.dev/) with Bcrypt salt rounds and session JWT tokens.
- **Media Management**: [Cloudinary](https://cloudinary.com/) + [Cloudflare R2](https://www.cloudflare.com/products/r2/) zero-egress asset storage.
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with custom luxury dark aesthetic tokens.
- **Integrations**: Razorpay, Meta WhatsApp Cloud API, Nodemailer / SMTP Gateway, Google Analytics 4, and GTM.

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js >= 18.18.0
- pnpm >= 9.x (or npm >= 10.x)
- MongoDB Connection String (Atlas or Local)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/RR-DigitalSolutions/be-my-traveller-webapp.git
   cd be-my-traveller-webapp
   ```

2. **Install dependencies**:
   ```bash
   cd bemytraveller
   pnpm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env.local` and configure your credentials:
   ```bash
   cp .env.example .env.local
   ```

4. **Start Development Server**:
   ```bash
   pnpm dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the client webapp, or [http://localhost:3000/admin](http://localhost:3000/admin) for the Admin CMS.

---

## 🌐 Live Production Deployment

### Quick Deploy to Vercel
1. Import the repository on [Vercel](https://vercel.com).
2. Set root directory to `bemytraveller`.
3. Add the production environment variables from `.env.example`.
4. Add your custom domain (e.g. `www.bemytraveller.com`) in **Project Settings → Domains**.

---

## 🏢 Developed & Maintained by
**RR Digital Solutions** — *Building High-Performance Digital Architectures for Enterprise Travel.*
