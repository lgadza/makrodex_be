import { Server } from 'socket.io';
const initializeSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: '*', // Adjust according to your needs
            methods: ['GET', 'POST']
        }
    });
    let users = [];

    const addUser = (user_id, socket_id) => {
      !users.some((user) => user.user_id === user_id) &&
        users.push({ user_id, socket_id });
    };
    
    const removeUser = (socket_id) => {
      users = users.filter((user) => user.socket_id !== socket_id);
    };
    
    const getUser = (user_id) => {
      return users.find((user) => user.user_id === user_id);
    };
    
   
    

io.on('connection', (socket) => {
    console.log(`New user connected: ${socket.id}`);

    // Handling adding a user online
    socket.on("addUser", (user_id) => {
        addUser(user_id, socket.id);
        io.emit("getUsers", users);
      });


    // Handling message sending
   // When a user sends a message
  socket.on("sendMessage", async ({ sender_id, receiverId, text }) => {
    const user = getUser(receiverId);
    if (user) {
      io.to(user.socketId).emit("getMessage", {
        sender_id,
        text,
      });
    }

    try {
      // Send POST request message sending endpoint
      await axios.post('http://yourserver.com/api/messages/send-message', {
        sender_id: sender_id,
        receiver_id: receiverId,
        content: text
      });
    } catch (error) {
      console.error('Error sending message:', error);
      // Handle errors appropriately
    }
  });

    // Handling conversation creation
    socket.on("createConversation", async (data) => {
        try {
          const response = await axios.post('http://yourserver.com/api/conversations/create-conversation', data);
          // Emit back to the creator with the new conversation details
          socket.emit("conversationCreated", response.data);
        } catch (error) {
          console.error('Error creating conversation:', error);
          // Handle errors appropriately - maybe notify the user
        }
      });

    // Adding participants to a conversation
 // When a user adds participants to a conversation
 socket.on("addParticipants", async ({ user_id, conversationId, participants }) => {
    try {
      // Send POST request to your add participant endpoint
      const response = await axios.post(`http://yourserver.com/api/conversations/add-user-to-conversation/${conversationId}`, {
        user_id: user_id,
        participants
      });

      // Notify the client about the successful addition of participants
      socket.emit("participantsAdded", response.data);

      // Optionally, inform the added participants in real-time if needed
      participants.forEach(participant => {
        const onlineParticipant = getUser(participant.participant_id);
        if (onlineParticipant) {
          io.to(onlineParticipant.socketId).emit("addedToConversation", { conversationId });
        }
      });

    } catch (error) {
      console.error('Error adding participants:', error);
      // Handle errors appropriately
    }
  });

    // When a user marks a message as read
    socket.on("markMessageRead", async ({ message_id, user_id,sender_id }) => {
        try {
          // Send POST request to your update read receipt endpoint
          await axios.post('http://yourserver.com/api/messages/mark-message-read', {
            message_id: message_id,
            user_id: user_id
          });
    
          const sender = getUser(sender_id);
          if (sender) {
            io.to(sender.socketId).emit("messageRead", { message_id, user_id });
          }
    
        } catch (error) {
          console.error('Error marking message as read:', error);
          // Handle errors appropriately
        }
      });
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
})
return io;
};
export default initializeSocket;