class DrawingStateManager {
    constructor() {
        this.rooms = new Map();
    }
    
    initRoom(roomId) {
        if (!this.rooms.has(roomId)) {
            this.rooms.set(roomId, {
                operations: [],
                currentIndex: -1
            });
        }
    }
    
    getState(roomId) {
        this.initRoom(roomId);
        const room = this.rooms.get(roomId);
        return {
            operations: room.operations.slice(0, room.currentIndex + 1),
            currentIndex: room.currentIndex
        };
    }
    
    addOperation(roomId, operation) {
        this.initRoom(roomId);
        const room = this.rooms.get(roomId);
        room.operations = room.operations.slice(0, room.currentIndex + 1);
        room.operations.push(operation);
        room.currentIndex = room.operations.length - 1;
        return true;
    }
    
    undo(roomId) {
        this.initRoom(roomId);
        const room = this.rooms.get(roomId);
        if (room.currentIndex >= 0) {
            room.currentIndex--;
            return { success: true, currentIndex: room.currentIndex };
        }
        return { success: false };
    }
    
    redo(roomId) {
        this.initRoom(roomId);
        const room = this.rooms.get(roomId);
        if (room.currentIndex < room.operations.length - 1) {
            room.currentIndex++;
            return { success: true, currentIndex: room.currentIndex };
        }
        return { success: false };
    }
    
    clear(roomId) {
        this.initRoom(roomId);
        const room = this.rooms.get(roomId);
        room.operations = [];
        room.currentIndex = -1;
    }
    
    clearRoom(roomId) {
        this.rooms.delete(roomId);
    }
}

module.exports = DrawingStateManager;