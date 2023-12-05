import { Server } from 'socket.io';
const initializeSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: '*', // Adjust according to your needs
            methods: ['GET', 'POST']
        }
    });

io.on('connection', (socket) => {
    console.log(`New user connected: ${socket.id}`);

    // Handling message sending
    socket.on('sendMessage', async (data) => {
        try {
            const message = await MessageModel.create({
                sender_id: data.senderId,
                receiver_id: data.receiverId, // or conversation_id for group chats
                content: data.content
            });

            io.to(data.receiverId).emit('receiveMessage', message);
        } catch (error) {
            console.error('Error sending message:', error);
        }
    });

    // Handling conversation creation
    socket.on('createConversation', async (data) => {
        try {
            const conversation = await ConversationModel.create({
                name: data.name,
                creator_id: data.creatorId
            });

            // Emitting to the creator's client
            socket.emit('conversationCreated', conversation);
        } catch (error) {
            console.error('Error creating conversation:', error);
        }
    });

    // Adding participants to a conversation
    socket.on('addParticipant', async (data) => {
        try {
            const participant = await ParticipantModel.create({
                conversation_id: data.conversationId,
                user_id: data.userId
            });

            // Notifying participants
            io.to(data.conversationId).emit('participantAdded', participant);
        } catch (error) {
            console.error('Error adding participant:', error);
        }
    });

    // Updating read receipts
    socket.on('updateReadReceipt', async (data) => {
        try {
            const readReceipt = await ReadReceiptModel.create({
                message_id: data.messageId,
                user_id: data.userId,
                read_timestamp: new Date() // Or use Sequelize.NOW
            });

            io.to(data.messageId).emit('readReceiptUpdated', readReceipt);
        } catch (error) {
            console.error('Error updating read receipt:', error);
        }
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
})
return io;
};
export default initializeSocket;