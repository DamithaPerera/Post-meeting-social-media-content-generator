

# Post-meeting Social Media Content Generator

Generate, review, and automate social media posts from meeting transcripts. 🚀

![Frontend: React + Vite](https://img.shields.io/badge/frontend-React%20%2B%20Vite-blue)
![Backend: Node.js + Express](https://img.shields.io/badge/backend-Node.js%20%2B%20Express-green)
![Database: PostgreSQL](https://img.shields.io/badge/database-PostgreSQL-blue)
![License: MIT](https://img.shields.io/badge/license-MIT-yellow)

---

## 🚦 Quickstart


1. **Clone & Install**

```sh
git clone https://github.com/yourusername/Post-meeting-social-media-content-generator.git
cd Post-meeting-social-media-content-generator
```

2. **Setup Backend & Frontend**

- See [Backend Setup](#backend-setup)
- See [Frontend Setup](#frontend-setup)

3. **Run Locally**

- Backend: `npm run dev` or Docker
- Frontend: `npm run dev` or Docker

---


## 📁 Folder Structure

```text
backend/   # Node.js, Express, Prisma
frontend/  # React, Vite, TanStack Query
readme.md  # This file
```

---

---


## ✨ Features

- 🔑 **OAuth login:** Google, LinkedIn, Facebook
- 📅 **Multi-account Google Calendar aggregation**
- 🤖 **Recall.ai notetaker scheduling & polling**
- 📝 **AI-powered post drafting** (OpenAI or fallback)
- ⚡ **Automations per platform**
- 📋 **Copy & direct post to LinkedIn/Facebook**
- 🛠️ **Settings:** lead minutes, automations, social connections
- 🎨 **Clean React UI**

---


## 🏗️ Architecture

**Frontend:** React + Vite + Tailwind (optional), React Query, served by Nginx in Docker.

**Backend:** Node.js + Express + TypeScript, Prisma ORM (PostgreSQL), JWT cookies.

**Data:** PostgreSQL (users, OAuth accounts, meetings, automations, drafts, posts).


**Integrations:**

- Google OAuth + Calendar (multi-account) – event merge & dedupe.
- Recall.ai – notetaker bot joining + polling for transcript/media.
- LinkedIn, Facebook – OAuth + direct posting.
- OpenAI (optional) – for AI text; falls back to rule-based generation if absent.

---


## 🔧 Backend Setup

See [`backend/`](./backend) for details.

### Prerequisites

- Node.js 20+
- Docker + Docker Compose
- PostgreSQL instance (Docker provided)
- Credentials for Google, LinkedIn, Facebook, Recall.ai (and optionally OpenAI)


### Backend Environment Variables

Create `backend/.env` (see example in repo):

```env
# Postgres
DATABASE_URL=postgresql://postgres:postgres@db:5432/postmeeting?schema=public
# ...other variables...
```

---


## 🖥️ Frontend Setup

See [`frontend/`](./frontend) for details.


### Frontend Environment Variables

Create `frontend/.env`:

```env
VITE_API_BASE=http://localhost:8080
```

---


## 🔑 OAuth Setup

See instructions for [Google](https://console.cloud.google.com/), [LinkedIn](https://www.linkedin.com/developers/), [Facebook](https://developers.facebook.com/), and [Recall.ai](https://recall.ai/).

---


## 🐳 Docker Development

See Docker Compose files in [`backend/`](./backend) and [`frontend/`](./frontend).

---


## 🗄️ Database & Prisma

Schema: [`backend/prisma/schema.prisma`](./backend/prisma/schema.prisma)

---


## 📚 API Overview

See [`backend/src`](./backend/src) for implementation.

---


## 🖼️ Screenshots / Demo

<!-- Add screenshots or GIFs here -->

---


## 🛡️ Edge Cases & Safeguards

- Multiple Google accounts → events merged and deduped.
- No join link → platform shown as UNKNOWN, bot not scheduled.
- Shared Recall key → we only track our own call_ids; no /bots usage.
- Token refresh → Google refresh handled; LinkedIn/Facebook rely on user re-connect when needed.
- Posting limits → text-only posts; UI allows editing before posting.
- Security → JWT cookie (HTTP-only optional), CORS restricted by CORS_ORIGIN.

---


## 🆘 Troubleshooting

- **Google OAuth “unauthorized client”**: Ensure redirect URI EXACTLY matches and webshookeng@gmail.com is a test user.
- **No events appear**: Check that Google Calendar API is enabled. Inspect backend logs for events.list errors.
- **Recall.ai not joining**: Verify the event has a valid Zoom/Meet/Teams link. Confirm the meeting is within lead minutes and notetaker is ON. Check backend logs for /join-call/ errors.
- **Transcript is empty**: We poll every ~3 minutes; give it a few cycles post-meeting. If shared account limits are hit, retry later.
- **LinkedIn/Facebook posting fails**: Reconnect accounts in Settings. Confirm app permissions/scopes.
- **CORS or cookie issues**: Make sure CORS_ORIGIN includes the frontend origin and the frontend uses withCredentials.

---


## 📄 License

MIT

Architecture

Frontend: React + Vite + Tailwind (optional), React Query, served by Nginx in Docker.

Backend: Node.js + Express + TypeScript, Prisma ORM (PostgreSQL), JWT cookies.

Data: PostgreSQL (users, OAuth accounts, meetings, automations, drafts, posts).

Integrations:

Google OAuth + Calendar (multi-account) – event merge & dedupe.

Recall.ai – notetaker bot joining + polling for transcript/media.

LinkedIn, Facebook – OAuth + direct posting.

OpenAI (optional) – for AI text; falls back to rule-based generation if absent.

Folder Structure
backend/
  Dockerfile
  docker-compose.dev.yml
  package.json
  tsconfig.json
  prisma/
    schema.prisma
  src/...

frontend/
  Dockerfile
  docker-compose.dev.yml
  package.json
  vite.config.ts
  .env
  src/...

Features

Sign in with Google and pull all calendar events across multiple connected Google accounts.

Toggle per-event “send notetaker” to auto-join via Recall.ai X minutes before start.

Past meetings page with attendees, start time, and platform logo (Zoom/Meet/Teams).

Meeting detail:

View full transcript (when Recall.ai media is ready).

AI follow-up email draft.

Automations per platform generate social post drafts.

Copy and Post (publishes to LinkedIn/Facebook as the user).

Settings:

Connect LinkedIn/Facebook via OAuth.

Set lead minutes (when the bot joins).

Create/delete Automations (custom prompt/template per platform).

Prerequisites

Node.js 20+

Docker + Docker Compose

A PostgreSQL instance (Docker provided)

Credentials for Google, LinkedIn, Facebook, Recall.ai (and optionally OpenAI)

Environment Variables
Backend .env

Create backend/.env:

# Postgres
DATABASE_URL=postgresql://postgres:postgres@db:5432/postmeeting?schema=public

# Server
PORT=8080
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=dev_change_me_please

# Google OAuth — add webshookeng@gmail.com as a test user
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
GOOGLE_REDIRECT_URI=http://localhost:8080/auth/google/callback

# Recall.ai
RECALL_API_KEY=YOUR_RECALL_API_KEY
RECALL_JOIN_LEAD_MINUTES_DEFAULT=5

# LinkedIn OAuth
LINKEDIN_CLIENT_ID=YOUR_LINKEDIN_CLIENT_ID
LINKEDIN_CLIENT_SECRET=YOUR_LINKEDIN_CLIENT_SECRET
LINKEDIN_REDIRECT_URI=http://localhost:8080/auth/linkedin/callback

# Facebook OAuth
FACEBOOK_CLIENT_ID=YOUR_FACEBOOK_APP_ID
FACEBOOK_CLIENT_SECRET=YOUR_FACEBOOK_APP_SECRET
FACEBOOK_REDIRECT_URI=http://localhost:8080/auth/facebook/callback

# Optional LLM (fallback templates used if omitted)
OPENAI_API_KEY=


Note: Ensure the Authorized redirect URIs in Google/LinkedIn/Facebook match the values above.

Frontend .env

Create frontend/.env:

VITE_API_BASE=http://localhost:8080

OAuth Setup
Google Cloud Console

Create OAuth 2.0 Client (Web).

Authorized redirect URI: http://localhost:8080/auth/google/callback

Add test user: webshookeng@gmail.com

Enable Google Calendar API.

Copy Client ID/Secret to backend/.env.

LinkedIn Developer

Create an app, enable r_liteprofile, r_emailaddress, w_member_social.

Authorized redirect URI: http://localhost:8080/auth/linkedin/callback

Put Client ID/Secret in backend/.env.

Meta (Facebook)

Create an app (choose appropriate type), add Facebook Login & publish permissions.

Valid OAuth Redirect URI: http://localhost:8080/auth/facebook/callback

Put App ID/Secret in backend/.env.

Recall.ai

Get API Key and add to backend/.env.

We do not call /bots; we store our own call_id per meeting and poll /calls/{id}.

Local Development (two shells)

First time only: run DB + API, then apply Prisma migrations.

Shell 1 – Backend (starts Postgres + API):

cd backend
cp .env.example .env   # or paste your filled .env
docker compose -f docker-compose.dev.yml up --build


Apply DB schema (in a new terminal the first time):

# find API container name if needed: docker ps
docker exec -it $(docker ps -qf "name=api") npx prisma migrate dev --name init


Shell 2 – Frontend:

cd frontend
npm i
npm run dev
# open http://localhost:5173

Docker Development

If you prefer just Docker per app:

Backend (dev):

cd backend
docker compose -f docker-compose.dev.yml up --build


Frontend (nginx serve build):

cd frontend
docker compose -f docker-compose.dev.yml up --build
# opens on http://localhost:5173

Optional: Root docker-compose

Create a docker-compose.yml at the repo root if you want one command to run DB + API + Web:

version: "3.9"
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: postmeeting
    ports: ["5432:5432"]
    volumes: [pgdata:/var/lib/postgresql/data]

  api:
    build: ./backend
    env_file: ./backend/.env
    depends_on: [db]
    ports: ["8080:8080"]

  web:
    build: ./frontend
    environment:
      - VITE_API_BASE=http://localhost:8080
    depends_on: [api]
    ports: ["5173:80"]

volumes:
  pgdata:


Then:

docker compose up --build
# Apply prisma migrate once:
docker exec -it $(docker ps -qf "name=api") npx prisma migrate deploy

Database & Prisma

Schema is defined in backend/prisma/schema.prisma.

First migration: npx prisma migrate dev --name init

Generate client (CI hook runs automatically): npx prisma generate

DB models include: User, GoogleAccount, SocialAccount, UserSettings, Meeting, MeetingAttendee, Automation, SocialDraft, SocialPost.

API Overview

Base URL defaults to http://localhost:8080

Auth & Connections

GET /auth/google → Start Google OAuth (sets cookie on return).

GET /auth/linkedin?u=<userId> → Start LinkedIn OAuth.

GET /auth/facebook?u=<userId> → Start Facebook OAuth.

Settings

GET /settings → { settings, linkedinConnected, facebookConnected }

POST /settings → { botLeadMinutes }

GET /settings/automations → list

POST /settings/automations → create/update (body: { id?, name, platform, template, enabled })

DELETE /settings/automations/:id

Calendar

GET /calendar/events → upcoming events synced into DB; merged across Google accounts.

POST /calendar/toggle → { meetingId, on } to enable/disable Recall bot for a meeting.

Meetings

GET /meetings → past meetings list

GET /meetings/:id → single meeting (+attendees)

GET /meetings/:id/transcript → { transcript } (string)

GET /meetings/:id/email-draft → { draft }

GET /meetings/:id/social-drafts → list of drafts

POST /meetings/:id/generate-drafts → runs Automations to create platform drafts

POST /meetings/:id/post → body { platform: "LINKEDIN"|"FACEBOOK", content } → posts & stores SocialPost

How It Works

Login/Connect Google
Visiting /auth/google stores a JWT cookie after OAuth. The frontend calls /calendar/events to load and persist upcoming events, deduped by accountId:eventId.

Notetaker Scheduling
You toggle “Send notetaker” on an event.
A cron job (every minute) finds meetings starting within lead minutes and calls Recall.ai /join-call/ with the conference link. Stores call_id.

Polling for Transcript
Another cron (every 3 minutes) polls /calls/{call_id}. When transcript/media links appear, it saves them to the meeting.

Past Meetings
After the end time passes, meetings show in Past. Open one to view Transcript, AI Email, and Social Drafts.

Automations & Posting
Create Automations in Settings (prompt/template per platform).
Click Generate social drafts to produce drafts. Open a draft → Copy or Post to LinkedIn/Facebook via their APIs.

AI
If OPENAI_API_KEY is provided, we use Chat Completions. Otherwise we use safe, readable fallback templates (no external calls).

Edge Cases & Safeguards

Multiple Google accounts → events merged and deduped.

No join link → platform shown as UNKNOWN, bot not scheduled.

Shared Recall key → we only track our own call_ids; no /bots usage.

Token refresh → Google refresh handled; LinkedIn/Facebook rely on user re-connect when needed.

Posting limits → text-only posts; UI allows editing before posting.

Security → JWT cookie (HTTP-only optional), CORS restricted by CORS_ORIGIN.

Troubleshooting

Google OAuth “unauthorized client”
Ensure redirect URI EXACTLY matches and webshookeng@gmail.com is a test user.

No events appear
Check that Google Calendar API is enabled. Inspect backend logs for events.list errors.

Recall.ai not joining

Verify the event has a valid Zoom/Meet/Teams link.

Confirm the meeting is within lead minutes and notetaker is ON.

Check backend logs for /join-call/ errors.

Transcript is empty
We poll every ~3 minutes; give it a few cycles post-meeting. If shared account limits are hit, retry later.

LinkedIn/Facebook posting fails
Reconnect accounts in Settings. Confirm app permissions/scopes.

CORS or cookie issues
Make sure CORS_ORIGIN includes the frontend origin and the frontend uses withCredentials.