class RoomManager {
    constructor() {
        this.rooms = new Map();
    }
    
    addUser(roomId, userId) {
        if (!this.rooms.has(roomId)) {
            this.rooms.set(roomId, new Set());
        }
        this.rooms.get(roomId).add(userId);
    }
    
    removeUser(roomId, userId) {
        if (this.rooms.has(roomId)) {
            this.rooms.get(roomId).delete(userId);
            if (this.rooms.get(roomId).size === 0) {
                this.rooms.delete(roomId);
            }
        }
    }
    
    getUsers(roomId) {
        return this.rooms.has(roomId) ? Array.from(this.rooms.get(roomId)) : [];
    }
    
    getUserCount(roomId) {
        return this.rooms.has(roomId) ? this.rooms.get(roomId).size : 0;
    }
    
    getUserIndex(roomId, userId) {
        const users = this.getUsers(roomId);
        return users.indexOf(userId);
    }
}

module.exports = RoomManager;