# 🎮 Game Mash

**A retro-inspired multi-device arcade game platform where players use their phones as controllers to play games on the main screen via QR code pairing.**

Built for **Hack UMBC 2025** with a nostalgic BINGO theme and pixel-perfect retro aesthetics featuring the UMBC Retriever mascot and classic tech icons.

🌐 **Live Demo**: [https://hackumbcgamemash.web.app](https://hackumbcgamemash.web.app)
📱 **Scan & Play**: Generate QR codes for instant mobile controller pairing

---

## 🎯 Features

- **🔗 QR Code Pairing**: Instant session creation and mobile device pairing
- **🎮 Multiple Game Modes**: Memory, Racing, and Platformer games
- **📱 Mobile Controllers**: Use your phone as a game controller
- **⚡ Real-time Sync**: Firebase-powered multiplayer synchronization
- **🎨 Retro Aesthetic**: Pixel-perfect graphics with LL Baguid font
- **🏫 UMBC Themed**: Custom UMBC Retriever mascot and college branding
- **🎲 BINGO Design**: Retro tech icons and alternating yellow/black checkerboard pattern

---

## 🎮 Games

### 🧠 Memory Game (BINGO Theme)

- **Objective**: Match pairs of retro tech icons in a classic memory card game
- **Design**: UMBC Retriever logo card backs, alternating yellow/black checkerboard pattern
- **Icons**: Cassette tapes, Game Boys, floppy disks, phones, CDs, controllers, TVs, headphones
- **Controls**: Mobile tap to flip cards
- **Scoring**: Based on completion time and number of moves

### 🏁 Racing Game

- **Objective**: Navigate through 3 lanes while dodging roadblockers to reach the finish line
- **Features**: Character animation (left/right sprites), collision detection with slowdown effects
- **Controls**:
  - Tap main button to move forward
  - Lane buttons (1, 2, 3) to switch lanes and dodge obstacles
- **Visual**: Dirt roads with grass borders, animated character movement

### 🏃 Platformer Game

- **Objective**: Classic side-scrolling platformer action
- **Controls**: Mobile controller for jumping and movement
- **Features**: Physics-based gameplay with collision detection

---

## 🛠 Tech Stack

### Frontend

- **React** `^19.1.1` - UI framework with functional components and hooks
- **TypeScript** `^4.9.5` - Type-safe JavaScript development
- **Tailwind CSS** `^4.1.13` - Utility-first CSS framework
- **React Router DOM** `^7.9.3` - Client-side routing

### Backend

- **Node.js** with **Express** `^4.18.2` - Web server framework
- **Socket.io** `^4.7.2` - Real-time bidirectional communication
- **TypeScript** `^5.1.6` - Backend type safety

### Database & Services

- **Firebase** `^12.3.0` - Realtime Database for game state synchronization
- **Firebase Hosting** - Frontend deployment platform
- **QR Code Generation** - `qrcode ^1.5.3` for session pairing

### Development & Deployment

- **Railway** - Backend server hosting
- **Concurrently** `^8.2.2` - Parallel development server execution
- **Nodemon** `^3.0.1` - Development server auto-restart

### Design Assets

- **LL Baguid Font** - Custom retro gaming typography
- **Pixel Art Assets** - Custom UMBC-themed game graphics
- **Retro Tech Icons** - Cassette, Game Boy, floppy disk, etc.

---

## 📁 Project Structure

```
Game-Mash/
├── client/                          # React Frontend
│   ├── public/
│   │   ├── assets/                  # Game assets and images
│   │   │   ├── BINGO*.png          # Memory game icons
│   │   │   ├── character*.png      # Racing game sprites
│   │   │   ├── play-button.png     # UI elements
│   │   │   └── roadblocker.png     # Game obstacles
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── games/              # Main game components
│   │   │   │   ├── MemoryGame.tsx  # BINGO memory card game
│   │   │   │   ├── RacingGame.tsx  # 3-lane racing game
│   │   │   │   └── PlatformerGame.tsx # Side-scrolling platformer
│   │   │   ├── controllers/        # Mobile controller components
│   │   │   │   ├── MemoryGameController.tsx
│   │   │   │   ├── RacingGameController.tsx
│   │   │   │   └── PlatformerGameController.tsx
│   │   │   ├── Controller.tsx      # Main mobile controller interface
│   │   │   ├── MainDisplay.tsx     # Game selection screen
│   │   │   └── QRCodeGenerator.tsx # Session QR code creation
│   │   ├── services/
│   │   │   ├── firebaseService.ts  # Firebase Realtime Database
│   │   │   ├── gameStatsService.ts # Game statistics tracking
│   │   │   └── socketService.ts    # Socket.io client integration
│   │   ├── App.tsx                 # Main app routing and state
│   │   └── index.tsx               # React app entry point
│   ├── package.json                # Frontend dependencies
│   └── tailwind.config.js          # Tailwind CSS configuration
├── server/                         # Express Backend
│   ├── src/
│   │   └── index.ts               # Express server with Socket.io
│   ├── package.json               # Backend dependencies
│   └── tsconfig.json              # TypeScript configuration
├── shared/
│   └── types.ts                   # Shared TypeScript interfaces
├── firebase.json                  # Firebase hosting configuration
├── .firebaserc                    # Firebase project settings
├── database.rules.json            # Firebase security rules
└── package.json                   # Root workspace configuration
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16+)
- **npm** or **yarn**
- **Firebase account**
- **Railway account** (for server deployment)

### 1. Installation

```bash
# Clone the repository
git clone https://github.com/your-username/game-mash.git
cd game-mash

# Install all dependencies (client, server, and root)
npm run install:all
```

### 2. Firebase Setup

1. **Create Firebase Project**

   ```bash
   # Visit https://console.firebase.google.com
   # Create new project: "hackumbcgamemash"
   ```

2. **Enable Services**

   - ✅ **Realtime Database** (for game state synchronization)
   - ✅ **Hosting** (for frontend deployment)

3. **Get Configuration**

   ```bash
   # Go to Project Settings > General
   # Copy your web app config object
   ```

4. **Environment Variables**

   **Client** (`client/.env`):

   ```env
   REACT_APP_FIREBASE_API_KEY=your_api_key_here
   REACT_APP_FIREBASE_AUTH_DOMAIN=hackumbcgamemash.firebaseapp.com
   REACT_APP_FIREBASE_DATABASE_URL=https://hackumbcgamemash-default-rtdb.firebaseio.com
   REACT_APP_FIREBASE_PROJECT_ID=hackumbcgamemash
   REACT_APP_FIREBASE_STORAGE_BUCKET=hackumbcgamemash.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   ```

### 3. Development

```bash
# Start both client and server simultaneously
npm run dev

# Or start individually:
npm run client:dev    # Client on http://localhost:3000
npm run server:dev    # Server on http://localhost:3001
```

### 4. Testing the Connection

1. Open [http://localhost:3000](http://localhost:3000)
2. Click any game button to start a session
3. Scan the QR code with your mobile device
4. Use your phone as a controller!

---

## 🎮 How to Play

### Starting a Game Session

1. **Main Screen**: Open the app on a large screen (laptop/TV)
2. **Select Game**: Choose Memory, Racing, or Platformer
3. **Generate QR**: A QR code appears on screen
4. **Mobile Scan**: Players scan QR code with their phones
5. **Join Session**: Enter your name on mobile device
6. **Start Playing**: Use mobile as game controller

### Game Controls

#### Memory Game Controller

- **Tap cards**: Select cards to flip and match pairs
- **Visual feedback**: See card flips synchronized across all devices

#### Racing Game Controller

- **Main tap button**: Move character forward
- **Lane buttons (1, 2, 3)**: Switch lanes to dodge roadblockers
- **Lane indicator**: Visual representation of current lane

#### Platformer Game Controller

- **Directional controls**: Move character left/right
- **Jump button**: Platform jumping mechanics

---

## 🏗 Architecture

### Real-time Multiplayer System

```
┌─────────────────┐    QR Code     ┌─────────────────┐
│   Main Display  │ ◄─────────────► │ Mobile Controls │
│   (Laptop/TV)   │                │   (Phones)      │
└─────────┬───────┘                └─────────┬───────┘
          │                                  │
          │            Firebase              │
          │         Realtime Database        │
          └─────────────┬────────────────────┘
                        │
              ┌─────────▼─────────┐
              │   Game State      │
              │ • Player actions  │
              │ • Game progress   │
              │ • Score tracking  │
              │ • Session data    │
              └───────────────────┘
```

### Data Flow

1. **Session Creation**: Main display generates unique session ID
2. **QR Code Pairing**: Mobile devices scan QR to join session
3. **Real-time Sync**: All actions broadcast via Firebase Realtime Database
4. **State Management**: Game state synchronized across all connected devices
5. **Controller Events**: Mobile inputs trigger game actions on main display

---

## 🚀 Deployment

### Frontend (Firebase Hosting)

```bash
# Build the client
npm run build

# Deploy to Firebase
npm install -g firebase-tools
firebase login
firebase deploy
```

### Backend (Railway)

1. **Connect Repository**:

   ```bash
   # Visit https://railway.app
   # Connect your GitHub repository
   # Select the /server directory as root
   ```

2. **Environment Variables**:

   ```env
   PORT=3001
   NODE_ENV=production
   ```

3. **Deploy**:
   Railway automatically deploys on git push to main branch

### Domain Configuration

- **Frontend**: `https://hackumbcgamemash.web.app`
- **Backend**: `https://your-app.railway.app`
- **CORS**: Update server CORS origins for production URLs

---

## 📱 Mobile Compatibility

### Tested Devices

- ✅ **iOS Safari** (iPhone 12+)
- ✅ **Android Chrome** (Android 10+)
- ✅ **Mobile Firefox**

### QR Code Scanner

- Uses device camera for QR code scanning
- Fallback manual session ID entry
- Responsive mobile interface

### Touch Controls

- Optimized for touch interfaces
- Haptic feedback simulation
- Prevents accidental touches

---

## 🎨 Design System

### Typography

- **Primary Font**: LL Baguid (retro gaming)
- **Fallback**: Arial, sans-serif
- **Sizes**: Responsive scaling for mobile/desktop

### Color Palette

```css
/* BINGO Theme Colors */
--bingo-yellow: #ffe46f
--bingo-black: #000000
--sky-blue: #74c5ff
--grass-green: #1eb710
--dirt-brown: #b08756
```

### Asset Guidelines

- **Resolution**: High-DPI pixel art (2x scaling)
- **Format**: PNG with transparency
- **Style**: Retro 8-bit/16-bit aesthetic
- **Branding**: UMBC Retriever integration

---

## 🧪 Development Guidelines

### Code Style

- **TypeScript**: Strict mode enabled
- **React**: Functional components with hooks
- **Naming**: PascalCase for components, camelCase for functions
- **CSS**: Tailwind utility classes preferred

### Component Architecture

```typescript
// Game Component Pattern
interface GameProps {
  onGameEnd?: (score: number, moves: number) => void;
  sessionId?: string;
}

const Game: React.FC<GameProps> = ({ onGameEnd, sessionId }) => {
  // Game logic using hooks
  // Firebase integration
  // Real-time synchronization
};
```

### State Management

- **Local State**: React useState for component state
- **Global State**: Props drilling and context (minimal)
- **Real-time State**: Firebase Realtime Database
- **Session State**: Persistent across page refreshes

### Adding New Games

1. **Create Game Component** (`client/src/components/games/NewGame.tsx`)
2. **Create Controller** (`client/src/components/controllers/NewGameController.tsx`)
3. **Update App Router** (add to game selection in `App.tsx`)
4. **Add Controller Route** (update `Controller.tsx` switch statement)
5. **Design Assets** (add to `client/public/assets/`)

---

## 🐛 Troubleshooting

### Common Issues

#### QR Code Not Scanning

```bash
# Check camera permissions
# Try manual session ID entry
# Verify network connectivity
```

#### Firebase Connection Failed

```bash
# Verify environment variables
# Check Firebase project settings
# Ensure Realtime Database is enabled
# Validate security rules
```

#### Mobile Controller Not Responding

```bash
# Check session ID match
# Verify Firebase connection
# Clear browser cache
# Try incognito/private mode
```

#### Performance Issues

```bash
# Disable unnecessary browser extensions
# Close other tabs/applications
# Check network latency
# Verify device specifications
```

### Debug Mode

```javascript
// Enable Firebase debugging
localStorage.debug = "firebase:*";

// View real-time database in browser
// https://console.firebase.google.com/project/hackumbcgamemash/database
```

---

## 📊 Performance Optimization

### Client Optimization

- **Bundle Size**: Code splitting for games
- **Images**: Optimized PNG compression
- **Caching**: Service worker for offline assets
- **Rendering**: React.memo for expensive components

### Firebase Optimization

- **Connection Pooling**: Reuse database connections
- **Data Structure**: Flat database design for efficiency
- **Cleanup**: Remove expired sessions automatically
- **Indexing**: Optimize query performance

---

## 🤝 Contributing

### Getting Started

1. Fork the repository
2. Create feature branch (`git checkout -b feature/new-game`)
3. Follow code style guidelines
4. Add tests for new functionality
5. Submit pull request

---

**Made with ❤️ for Hack UMBC 2025**
_Bringing retro arcade gaming to the modern web_
