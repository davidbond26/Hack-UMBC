# Hackathon Web Game

A multi-device web game where players scan QR codes to control games from their phones. Features mini-games and personalized bingo boards.

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, Socket.io
- **Database**: Firebase
- **QR Code**: qrcode, qr-scanner

## Project Structure

```
├── client/          # React frontend
├── server/          # Express backend
├── shared/          # Shared types and utilities
└── package.json     # Root package with scripts
```

## Getting Started

1. Install dependencies:
   ```bash
   npm run install:all
   ```

2. Set up Firebase configuration (see Firebase Setup below)

3. Start development servers:
   ```bash
   npm run dev
   ```

   This will start:
   - Client on http://localhost:3000
   - Server on http://localhost:3001

## Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Firestore Database
3. Create service account key and download JSON
4. Add environment variables (see .env.example files)

## Scripts

- `npm run dev` - Start both client and server in development mode
- `npm run build` - Build client for production
- `npm run start` - Start production server
- `npm run install:all` - Install all dependencies
