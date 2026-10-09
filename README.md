# Real-Time Chat Application

A full-stack MERN real-time messaging app with persisted delivery/read receipts,
message reactions, and a Socket.IO layer designed to run behind a load balancer.

## Features

- **Auth** — signup/login with bcrypt-hashed passwords and a JWT stored in an
  httpOnly, sameSite cookie (not accessible to JavaScript, not sent cross-site).
- **Real-time messaging** — messages are written to MongoDB first, then pushed
  live over Socket.IO to the recipient if they're online. If they're offline,
  the message is still there the next time they open the chat — no messages
  are lost.
- **Delivery & read receipts** — each message tracks who it was delivered to
  and read by, with timestamps, persisted in MongoDB (not just client state).
  Ticks update live: sent → delivered → read.
- **Message reactions** — emoji reactions per message, scoped and pushed only
  to the two people in that conversation.
- **Cursor-based pagination** — chat history loads in pages of 20 (`?before=`
  a timestamp cursor), so opening a conversation with years of history doesn't
  pull it all into memory at once.
- **Rate limiting** — login/signup are throttled per IP; sending messages is
  throttled per user.
- **Horizontal scaling (optional)** — set `REDIS_URL` and the Socket.IO layer
  runs correctly across multiple server instances: presence (who's online) is
  kept in a shared Redis hash, and the Socket.IO Redis adapter fans out
  `io.to(socketId).emit(...)` calls across every instance. Leave `REDIS_URL`
  unset and it runs fine as a single instance with an in-memory map — nothing
  is required to get started locally.

## Tech stack

- **Frontend:** React (Vite), Tailwind + daisyUI, Zustand for chat state,
  React Router, Socket.IO client.
- **Backend:** Express, MongoDB/Mongoose, Socket.IO, JWT auth, bcrypt.
- **Scaling:** Redis (pub/sub adapter + shared presence store), optional.

## Project structure

```
back_end/
  controllers/   # auth, message, user route handlers
  middleware/     # JWT auth guard, rate limiters
  model/          # Mongoose schemas (User, Message, Conversation)
  routes/
  sockte/         # Socket.IO server + presence/adapter setup
  server.js
front_end/
  src/
    context/      # auth user, socket connection, UI state
    hooks/         # data fetching + socket event hooks
    zustand/       # chat message/selection store
    components/
    pages/
```

## Running locally

### Backend

```bash
cd back_end
cp .env.example .env   # fill in MONGODB_URI and JWT_SECRET at minimum
npm install
npm run dev
```

### Frontend

```bash
cd front_end
npm install
npm run dev
```

The Vite dev server proxies `/api` requests to the backend, so no CORS setup
is needed in development.

### Optional: running with Redis (multi-instance)

```bash
# start a local Redis, e.g.
docker run -p 6379:6379 redis:7

# then in back_end/.env
REDIS_URL=redis://localhost:6379
```

With `REDIS_URL` set, you can run two copies of `back_end` behind a load
balancer and users connected to different instances will still see each
other's online status and messages in real time.

## Security notes

- Passwords are bcrypt-hashed before storage; the hash is never returned to
  the client (`.select("-password")` everywhere a user document is read).
- The JWT lives in an httpOnly, sameSite=strict cookie, marked `secure` in
  production.
- Every message/reaction route checks that the requesting user is actually a
  participant in that conversation — not just that they're logged in.
- Login/signup are rate-limited per IP; message sending is rate-limited per
  user.
