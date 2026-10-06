# KabaleNU "Campus Connect"

An exclusive social platform for National University (NU) Clark students and faculty. Campus Connect brings a trending newsfeed, campus events, a student marketplace, and interest-based channels into one place, with NU Blue and Gold branding.

Built for the CTADWEBL Final Project.

## Group Members

| Name | GitHub | Slice |
| ---- | ------ | ----- |
| Kaleb Cunanan | [@kalebcunanan](https://github.com/kalebcunanan) | Auth, Users, Landing |

## Concept

Students and faculty of NU Clark currently rely on scattered Facebook groups for announcements, buying and selling, and event sign-ups. Campus Connect replaces them with one verified space:

- **Faculty (admin)** post official events and moderate reported content.
- **Bulldogs (college students)** and **Bullpups (senior high students)** post, react, comment, buy and sell, register for events, and chat in channels.

## What Data Is Processed

| Processing | Description |
| ---------- | ----------- |
| Trending feed | A Hotness Score computed from Bulldog Reacts, comments, and post age. |
| Event registration | Checks slot capacity and time-range conflicts with the user's other registrations. |
| Marketplace search | Filters by multiple criteria and computes the average price of the results. |
| Status transition | Moves an item through Available, Reserved, and Sold with validated transitions. |
| Leaderboard | Ranks students by Bulldog Score earned from posts, reacts, and event registrations. |
| Auto-hide moderation | Hides a post once it reaches 5 reports (one report per user). |

## Tech Stack

- **Client:** React (Vite), TypeScript, Tailwind CSS, React Router, React Hook Form, Zod, Axios
- **Server:** Node.js, Express, MongoDB Atlas, Mongoose, JWT in httpOnly cookies, bcryptjs

## Features

- [x] JWT authentication with httpOnly cookies and role-based access
- [x] Login and Register pages with Zod validation
- [x] Protected routes and session restore
- [x] Trending newsfeed, comments, and Bulldog Reacts
- [x] Campus events and registration with conflict checking
- [x] Marketplace with multi-criteria search and Good Deal badges
- [x] Channels and messages
- [x] Leaderboard
- [x] Content moderation

## Screenshots

### Login
![Login page](docs/screenshots/login.png)

### Home
![Home page](docs/screenshots/home.png)

## Setup

### Prerequisites

- Node.js 18.11 or newer
- A MongoDB Atlas cluster and connection string

### 1. Clone the repository

```bash
git clone https://github.com/kalebcunanan/KabaleNU-campus-connect.git
cd KabaleNU-campus-connect
```

### 2. Server

```bash
cd server
npm install
cp .env.example .env
npm run dev
```

Fill in `server/.env`:

| Variable | Description | Example |
| -------- | ----------- | ------- |
| `PORT` | Port the API listens on | `5000` |
| `MONGO_URI` | MongoDB Atlas connection string | `mongodb+srv://<user>:<password>@<cluster>/campus-connect` |
| `JWT_SECRET` | Secret used to sign tokens | a long random string |
| `JWT_EXPIRES_IN` | Token lifetime | `7d` |
| `CLIENT_URL` | Exact client origin allowed by CORS | `http://localhost:5173` |

### 3. Client

```bash
cd client
npm install
npm run dev
```

The app runs at `http://localhost:5173` and talks to the API through a single configured Axios instance in `client/src/lib/axios.ts`.

### 4. Seed data

Run this after the seed script is added in `server/utils/seedData.js`:

```bash
cd server
node utils/seedData.js
```

## API Documentation

All errors return JSON in the form `{ "message": "..." }`. Status codes: 200 success, 201 created, 400 validation or business-rule error, 401 not logged in, 403 wrong role or not the owner, 404 not found, 500 server error.

### Users and Auth (`/api/users`)

| Method | Path | Purpose | Auth |
| ------ | ---- | ------- | ---- |
| POST | `/api/users/register` | Create an account and set the session cookie | Public |
| POST | `/api/users/login` | Log in and set the session cookie | Public |
| POST | `/api/users/logout` | Clear the session cookie | Public |
| GET | `/api/users/me` | Return the logged-in user | Required |
| GET | `/api/users/leaderboard` | Return Top 10 students by Bulldog Score | Public |
| GET | `/api/users/me/registrations` | Return all events the user is attending | Required |

Sample login request:

```json
{ "email": "admin01@email.com", "password": "yourpassword" }
```

Sample login response (200):

```json
{
  "_id": "6702f1c2a1b2c3d4e5f60718",
  "email": "admin01@email.com",
  "role": "faculty",
  "bulldogScore": 0
}
```

### Posts and Moderation (`/api/posts`)

| Method | Path | Purpose | Auth |
| ------ | ---- | ------- | ---- |
| GET | `/api/posts/trending` | Get posts sorted by Hotness Score | Required |
| POST | `/api/posts` | Create a new post | Required |
| POST | `/api/posts/:id/react` | Add a Bulldog React (+1 Hotness Score) | Required |
| POST | `/api/posts/:id/report` | Report a post (hides after 5 reports) | Required |

### Events (`/api/events`)

| Method | Path | Purpose | Auth |
| ------ | ---- | ------- | ---- |
| GET | `/api/events` | Get all campus events | Required |
| POST | `/api/events` | Create a new event | Faculty only |
| POST | `/api/events/:id/register` | Register for an event (checks slot capacity and conflicts) | Required |

### Marketplace (`/api/market`)

| Method | Path | Purpose | Auth |
| ------ | ---- | ------- | ---- |
| GET | `/api/market/search` | Search items with filters and calculate the average price | Required |
| POST | `/api/market` | Post a pre-loved item for sale | Required |

### Channels (`/api/channels`)

| Method | Path | Purpose | Auth |
| ------ | ---- | ------- | ---- |
| GET | `/api/channels` | Get all interest-based channels | Required |
| POST | `/api/channels` | Create a new channel | Required |
| GET | `/api/channels/:id/messages` | Get all messages in a specific channel | Required |
| POST | `/api/channels/:id/messages` | Send a message to a specific channel | Required |

## Known Limitations

- Channels use HTTP refresh instead of WebSockets, so messages are not real time.
- Payments, file uploads, and deployment are outside the MVP scope.
- Images are not uploaded; posts and items are text based.
