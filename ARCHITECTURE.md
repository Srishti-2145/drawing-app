// ========== ARCHITECTURE.md ==========
# Architecture Documentation

## 📊 System Overview
```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Client A  │◄───────►│   Server    │◄───────►│   Client B  │
│   (Browser) │ Socket  │  (Node.js)  │ Socket  │   (Browser) │
└─────────────┘         └─────────────┘         └─────────────┘
       │                       │                       │
       │                  ┌────▼────┐                 │
       └─────────────────►│  State  │◄────────────────┘
                          │ Manager │
                          └─────────┘
```

## 🔄 Data Flow Diagram

### Drawing Event Flow
```
User Action (mousedown/move/up)
    │
    ▼
Canvas Event Handler
    │
    ▼
Collect Points into Path
    │
    ▼
Draw Locally (Immediate Feedback)
    │
    ▼
Create DrawingOperation Object
    │
    ├──► Add to Local Operation History
    │
    └──► Send via WebSocket
             │
             ▼
         Server Receives
             │
             ├──► Add to Server State
             │
             └──► Broadcast to Other Clients
                      │
                      ▼
                 Remote Clients Receive
                      │
                      ▼
                 Add to Local History
                      │
                      ▼
                 Render on Canvas
```

## 🔌 WebSocket Protocol

### Message Types

#### 1. **draw** (Client → Server → Clients)
```javascript
{
    type: 'draw',
    userId: 'user_abc123',
    pathData: {
        points: [{x: 100, y: 150}, {x: 101, y: 151}, ...],
        color: '#FF0000',
        size: 5,
        tool: 'brush'  // or 'eraser'
    },
    timestamp: 1699564800000
}
```

#### 2. **cursor-move** (Client → Server → Clients)
```javascript
{
    type: 'cursor-move',
    userId: 'user_abc123',
    position: {x: 250, y: 300}
}
```

#### 3. **undo** (Client → Server → All Clients)
```javascript
{
    type: 'undo',
    userId: 'user_abc123',
    timestamp: 1699564800000
}
```

#### 4. **redo** (Client → Server → All Clients)
```javascript
{
    type: 'redo',
    userId: 'user_abc123',
    timestamp: 1699564800000
}
```

#### 5. **clear** (Client → Server → All Clients)
```javascript
{
    type: 'clear',
    userId: 'user_abc123'
}
```

#### 6. **init-state** (Server → New Client)
```javascript
{
    type: 'init-state',
    operations: [/* all drawing operations */],
    users: [{userId: 'user_xyz', color: '#FF6B6B'}, ...]
}
```

#### 7. **user-joined** / **user-left** (Server → Clients)
```javascript
{
    type: 'user-joined',  // or 'user-left'
    userId: 'user_abc123',
    color: '#4ECDC4'
}
```

## 🔁 Undo/Redo Strategy

### The Challenge
Global undo/redo in a collaborative environment is complex because:
- Multiple users can draw simultaneously
- Undo should affect the most recent operation (regardless of user)
- Must maintain canvas consistency across all clients

### Our Solution: **Operation-Based History with Shared Index**
```
Operations Array: [Op1, Op2, Op3, Op4, Op5]
Current Index:                        ▲
                                      4

After Undo:      [Op1, Op2, Op3, Op4, Op5]
Current Index:                  ▲
                               3

After New Draw:  [Op1, Op2, Op3, Op4, Op6]  ← Op5 removed
Current Index:                        ▲
                                      4
```

### Implementation Details

**1. Operation Structure**
```javascript
class DrawingOperation {
    id: string;           // unique: userId_timestamp
    type: 'draw';
    userId: string;
    data: PathData;
    timestamp: number;
}
```

**2. State Management**
- Server maintains: `operations[]` and `currentIndex`
- Each undo decrements `currentIndex`
- Each redo increments `currentIndex`
- New operations truncate array at `currentIndex + 1`

**3. Rendering Strategy**
```javascript
function redrawCanvas() {
    clear();
    operations.slice(0, currentIndex + 1).forEach(op => {
        drawPath(op.data);
    });
}
```

## 🎯 Conflict Resolution

### Scenario: Simultaneous Drawing
```
Time →   T1          T2          T3          T4
User A:  [Drawing...........................finish]
User B:           [Drawing................finish]
```

### Strategy: **Last-Write-Wins with Timestamp Ordering**

1. **No Locks**: Both users draw freely
2. **Operations Timestamped**: Each operation gets `Date.now()`
3. **Server Orders**: Operations stored by arrival time
4. **Clients Render**: All operations in order received

### Example Flow:
```
1. User A starts drawing (T1)
2. User B starts drawing (T2)  
3. User B finishes first (T3) → Op2 sent to server
4. User A finishes (T4) → Op1 sent to server
5. Server receives: Op2, then Op1
6. Both rendered in received order
7. Result: Op2's strokes appear "under" Op1's strokes
```

### Why This Works:
- Drawing operations are **commutative** (order doesn't matter for final result)
- Users see their own strokes immediately (optimistic UI)
- Small latency means conflicts are rare
- Visual result is acceptable even with different ordering

### Alternative Considered (Rejected):
- **Operational Transform**: Too complex for drawing use case
- **CRDT**: Overkill for append-only operations
- **Locking**: Would hurt UX with drawing delays
---

**Last Updated**: 8th November 2024
**Author**: Srishti

**Time Investment**: 11 hours

