class Session {
    constructor(userId) {
        this.userId = userId;
        this.data = {}; // Store session-specific data here
        this.createdAt = new Date();
        this.lastUpdatedAt = new Date();
        this.step = 'awaiting_first_name'; // Initial step
        this.awaitingConfirmation = false; // Track if we are awaiting a confirmation response
    }

    // Update session data, step, and awaitingConfirmation status
    update(data, step, awaitingConfirmation = false) {
        this.data = {...this.data, ...data};
        this.step = step;
        this.awaitingConfirmation = awaitingConfirmation;
        this.lastUpdatedAt = new Date();
    }

    // Check if the session is expired (e.g., 30 minutes)
    isExpired() {
        const now = new Date();
        return (now - this.lastUpdatedAt) > 30 * 60 * 1000; // 30 minutes
    }
}

class SessionManager {
    constructor() {
        this.sessions = new Map(); // Using a Map to store sessions
    }

    // Retrieve a session by userId
    getSession(userId) {
        const session = this.sessions.get(userId);
        if (session && !session.isExpired()) {
            return session;
        } else {
            this.sessions.delete(userId); // Remove expired session
            return null;
        }
    }

    // Create a new session
    createSession(userId) {
        const newSession = new Session(userId);
        this.sessions.set(userId, newSession);
        return newSession;
    }

    // Update an existing session
    updateSession(userId, data, step, awaitingConfirmation) {
        const session = this.getSession(userId);
        if (session) {
            session.update(data, step, awaitingConfirmation);
        }
    }

    // End a session
    endSession(userId) {
        this.sessions.delete(userId);
    }
}

export default new SessionManager();
