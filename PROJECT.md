# Constituency Connect

## Vision

Constituency Connect is a WhatsApp-first Public Grievance Management Platform.

Citizens should never install another app.

They simply send a WhatsApp message to register complaints.

The system automatically collects:

- Constituency
- Area
- Ward
- Street
- Category
- Photo
- Description
- Location

The complaint is assigned to the MLA team.

The MLA dashboard allows:

- View complaints
- Assign complaints
- Update status
- Analytics
- Reports
- WhatsApp Notifications

## Tech Stack

Technology

Frontend:
- Next.js 15
- TypeScript
- Tailwind
- shadcn/ui

Backend:
- Next.js API Routes

Database:
- Firebase Firestore

Storage:
- Firebase Storage

Authentication:
- Firebase Authentication

Messaging:
- WhatsApp Cloud API

Coding Style:
- TypeScript
- Reusable Components
- Clean Architecture


## Architecture

Citizen

↓

WhatsApp

↓

Meta Cloud API

↓

NestJS Backend

↓

Firebase

↓

Dashboard

## Coding Rules

- Clean Architecture
- SOLID Principles
- TypeScript Strict Mode
- Reusable Components
- Mobile First
- Production Ready




# Constituency Connect

Goal:
Build a WhatsApp-based public grievance system.

Users:
- Citizens
- MLA
- Volunteers
- Admin

Features:
- Citizens register complaints through WhatsApp
- Upload images
- Share location
- Complaint tracking
- Dashboard for MLA team
- Complaint assignment
- Analytics
