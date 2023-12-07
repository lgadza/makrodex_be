import axios from 'axios';
    
let users = [];

export const initializeSocket = (newClient) => {

    const addUser = (user_id, socket_id) => {
      if (!users.some((user) => user.user_id === user_id)) {
        users.push({ user_id, socket_id });
      }
    };

    const removeUser = (socket_id) => {
      users = users.filter((user) => user.socket_id !== socket_id);
    };

    const getUser = (user_id) => {
      return users.find((user) => user.user_id === user_id);
    };

    newClient.on('connection', (socket) => {
        console.log(`New user connected: ${socket.id}`);
       

        socket.on("addUser", (user_id) => {
            addUser(user_id, socket.id);
            newClient.emit("getUsers", users);
        });
        console.log("USERS ONLINE",users)
        socket.on("sendMessage", async ({ sender_id, receiverId, text }) => {
            const user = getUser(receiverId);
            if (user) {
                newClient.to(user.socketId).emit("getMessage", {
                    sender_id,
                    text,
                });
            }

            try {
                await axios.post('http://yourserver.com/api/messages/send-message', {
                    sender_id: sender_id,
                    receiver_id: receiverId,
                    content: text
                });
            } catch (error) {
                console.error('Error sending message:', error);
                socket.emit("error", "Error sending message. Please try again later.");
            }
        });

        socket.on("createConversation", async (data) => {
            try {
                const response = await axios.post('http://yourserver.com/api/conversations/create-conversation', data);
                socket.emit("conversationCreated", response.data);
            } catch (error) {
                console.error('Error creating conversation:', error);
                socket.emit("error", "Error creating conversation. Please try again later.");
            }
        });

        socket.on("addParticipants", async ({ user_id, conversationId, participants }) => {
            try {
                const response = await axios.post(`http://yourserver.com/api/conversations/add-user-to-conversation/${conversationId}`, {
                    user_id: user_id,
                    participants
                });

                socket.emit("participantsAdded", response.data);

                participants.forEach(participant => {
                    const onlineParticipant = getUser(participant.participant_id);
                    if (onlineParticipant) {
                        newClient.to(onlineParticipant.socketId).emit("addedToConversation", { conversationId });
                    }
                });
            } catch (error) {
                console.error('Error adding participants:', error);
                socket.emit("error", "Error adding participants. Please try again later.");
            }
        });

        socket.on("markMessageRead", async ({ message_id, user_id, sender_id }) => {
            try {
                await axios.post('http://yourserver.com/api/messages/mark-message-read', {
                    message_id: message_id,
                    user_id: user_id
                });

                const sender = getUser(sender_id);
                if (sender) {
                    newClient.to(sender.socketId).emit("messageRead", { message_id, user_id });
                }
            } catch (error) {
                console.error('Error marking message as read:', error);
                socket.emit("error", "Error marking message as read. Please try again later.");
            }
        });

        socket.on('disconnect', () => {
            removeUser(socket.id);
            console.log(`User disconnected: ${socket.id}`);
        });
    });

    
};

