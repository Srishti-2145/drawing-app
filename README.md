// ========== README.md ==========
# Real-Time Collaborative Drawing Canvas

A multi-user drawing application where multiple people can draw simultaneously with real-time synchronization.

## 🚀 Quick Start

### Installation
```bash
npm install
```

### Running the Application
```bash
npm start
```

The server will start on `http://localhost:3000`

### Testing with Multiple Users
1. Open `http://localhost:3000` in your browser
2. Open the same URL in another browser tab or different browser
3. Start drawing in one tab - you'll see it appear in real-time in the other tab
4. Test undo/redo across both users
5. Try different colors and brush sizes

## 🎯 Features Implemented

### Core Features
- ✅ **Drawing Tools**: Brush and eraser with adjustable size (1-30px)
- ✅ **Color Picker**: Full spectrum color selection
- ✅ **Real-time Synchronization**: See other users drawing as they draw
- ✅ **User Indicators**: Color-coded users with live cursor positions
- ✅ **Global Undo/Redo**: Works across all users (Ctrl+Z / Ctrl+Y)
- ✅ **Clear Canvas**: Synchronized clear for all users
- ✅ **User Management**: Shows online users with unique colors

### Keyboard Shortcuts
- `B` - Switch to Brush tool
- `E` - Switch to Eraser tool
- `Ctrl+Z` - Undo
- `Ctrl+Y` - Redo

## 🏗️ Technical Stack

- **Frontend**: Vanilla JavaScript + HTML5 Canvas API
- **Backend**: Node.js + Express
- **WebSocket**: Socket.io for real-time communication
- **No frameworks**: Pure DOM manipulation and Canvas operations

## 📁 Project Structure
```
collaborative-canvas/
├── client/
│   └── index.html              # Complete frontend (HTML/CSS/JS)
├── server/
│   ├── server.js              # Express + Socket.io server
│   ├── rooms.js               # Room management logic
│   └── drawing-state.js       # Canvas state & operations
├── package.json
├── README.md
└── ARCHITECTURE.md
```

## 🧪 Testing Checklist

- [ ] Multiple users can draw simultaneously
- [ ] Drawing appears in real-time (< 100ms latency)
- [ ] Undo affects all users' canvas
- [ ] Redo works correctly after undo
- [ ] Clear canvas synchronizes across users
- [ ] Users see each other's cursors
- [ ] Disconnected users are removed from list
- [ ] Works in Chrome, Firefox, Safari

## ⚠️ Known Limitations

1. **No Persistence**: Canvas state is lost when all users disconnect
2. **Single Room**: All users join the same canvas (no room system yet)
3. **No Authentication**: Users are anonymous
4. **Memory**: Long sessions may accumulate many operations
5. **Network**: No offline mode or conflict resolution for network issues

## ⏱️ Time Spent

- **Planning & Architecture**: 1 hour
- **Canvas Implementation**: 3 hours
- **WebSocket Integration**: 2 hours
- **Global Undo/Redo**: 2 hours
- **UI/UX Polish**: 1 hour
- **Testing & Debugging**: 1 hour
- **Documentation**: 1 hour
- **Total**: ~11 hours
