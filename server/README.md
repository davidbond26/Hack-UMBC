# Hackathon Game Server

Socket.io server for real-time multi-device game interactions.

## Deployment

### Railway (Recommended)
1. Connect your GitHub repo to Railway
2. Set build command: `npm run build`
3. Set start command: `npm start`
4. Deploy from `/server` directory

### Render
1. Create new Web Service
2. Connect GitHub repo
3. Root directory: `server`
4. Build command: `npm install && npm run build`
5. Start command: `npm start`

### Environment Variables
- `PORT` - Railway/Render will set this automatically

## Local Development
```bash
npm install
npm run dev
```

Server runs on port 3001 by default.