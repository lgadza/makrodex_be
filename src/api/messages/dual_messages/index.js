import express from 'express';
import MessageModel from './model.js';
import { Op } from 'sequelize';
import { body, query, validationResult } from 'express-validator';
import UserModel from '../../users/model.js';
import ConversationModel from '../conversations/model.js';

const messageRouter = express.Router();

//! Get all messages
messageRouter.get('/retrieve-messages', [
   
    query('user1_id').isUUID().withMessage('User1 ID must be a valid UUID'),
    query('user2_id').isUUID().withMessage('User2 ID must be a valid UUID'),
    query('unread').optional().isBoolean().withMessage('Unread query must be a boolean')
], async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { user1_id,user2_id, unread } = req.query;

    try {
        const whereClause =  {
            [Op.or]: [
                {
                    [Op.and]: [
                        { sender_id: user1_id },
                        { receiver_id: user2_id }
                    ]
                },
                {
                    [Op.and]: [
                        { sender_id: user2_id },
                        { receiver_id: user1_id }
                    ]
                }
            ]
        };

        if (unread) {
            whereClause.read_status = false;
        }

        // Retrieve messages
        const messages = await MessageModel.findAll({
            where: whereClause,
            order: [['timestamp', 'ASC']]
        });

        res.status(200).json({
            message: 'Messages retrieved successfully',
            data: messages
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});

//! Get one message
messageRouter.get('/:id', async (req, res, next) => {
    try {
        const message = await MessageModel.findByPk(req.params.id);
        if (message) {
            res.json(message);
        } else {
            res.status(404).send('Message not found');
        }
    } catch (error) {
        next(error);
    }
});
//!1 Endpoint to mark a message as read
messageRouter.post('/mark-message-read', [
    body('message_id').isUUID().withMessage('Message ID must be a valid UUID'),
    body('user_id').isUUID().withMessage('User ID must be a valid UUID')
], async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { message_id, user_id } = req.body;

    try {
        // Find the message
        const message = await MessageModel.findOne({
            where: {
                message_id,
                receiver_id: user_id // Ensuring that only the intended recipient can mark it as read
            }
        });

        if (!message) {
            return res.status(404).json({ error: 'Message not found or you are not the recipient' });
        }

        // Update read_status to true
        await message.update({ read_status: true });

        res.status(200).json({
            message: 'Message marked as read successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});
//! Create a new message
messageRouter.post('/send-message', [
    body('sender_id').isUUID().withMessage('Sender ID must be a valid UUID'),
    body('receiver_id').isUUID().withMessage('Receiver ID must be a valid UUID'),
    body('conversation_id').isUUID().withMessage('Conversation ID must be a valid UUID'),
    body('content').trim().isLength({ min: 1 }).withMessage('Message content cannot be empty'),
], async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { sender_id, receiver_id, content,conversation_id } = req.body;

    try {
        // Validate existence of users
        const senderExists = await UserModel.findByPk(sender_id);
        const receiverExists = await UserModel.findByPk(receiver_id);
        const conversationExists = await ConversationModel.findByPk(conversation_id);

        if (!receiverExists) {
            return res.status(404).json({ error: 'Receiver id not found' });
        }
        if (!senderExists ) {
            return res.status(404).json({ error: 'Sender id not found' });
        }
        if (!conversationExists ) {
            return res.status(404).json({ error: 'Conversation id not found' });
        }

        // Create a new message
        const message = await MessageModel.create({
            sender_id,
            receiver_id,
            conversation_id,
            content,
        });

        res.status(201).json({
            message: 'Message sent successfully',
            data: message
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});
//! Update a message
messageRouter.put('/update-message', [
    body('message_id').isUUID().withMessage('Message ID must be a valid UUID'),
    body('user_id').isUUID().withMessage('User ID must be a valid UUID'),
    body('new_content').trim().isLength({ min: 1 }).withMessage('New content cannot be empty')
], async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { message_id, user_id, new_content } = req.body;

    try {
        // Find the message
        const message = await MessageModel.findOne({
            where: {
                message_id,
                sender_id: user_id // Ensuring that only the sender can update the message
            }
        });

        if (!message) {
            return res.status(404).json({ error: 'Message not found or you are not the sender' });
        }

        // Update the message content
        await message.update({ content: new_content });

        res.status(200).json({
            message: 'Message content updated successfully'
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// !Delete a message
messageRouter.post('/delete-message', [
    body('message_id').isUUID().withMessage('Message ID must be a valid UUID'),
    body('user_id').isUUID().withMessage('User ID must be a valid UUID')
], async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { message_id, user_id } = req.body;

    try {
        // Find the message
        const message = await MessageModel.findOne({
            where: {
                message_id,
                [Op.or]: [
                    { sender_id: user_id },
                    { receiver_id: user_id }
                ]
            }
        });

        if (!message) {
            return res.status(404).json({ error: 'Message not found or you are not authorized' });
        }

        // Delete the message
        await message.destroy();

        res.status(200).json({
            message: 'Message deleted successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});
// !Endpoint to list messages sent by a user
messageRouter.get('/list-sent-messages', [
    query('user_id').isUUID().withMessage('User ID must be a valid UUID')
], async (req, res) => {
    console.log("Query Parameters:", req.query); 
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { user_id } = req.query;

    try {
        // Find messages sent by the user
        const messages = await MessageModel.findAll({
            where: {
                sender_id: user_id
            }
        });

        res.status(200).json({
            message: 'Messages sent by user retrieved successfully',
            data: messages
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});
//! Endpoint to list messages received by a user
messageRouter.get('/list-received-messages', [
    query('user_id').isUUID().withMessage('User ID must be a valid UUID')
], async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { user_id } = req.query;

    try {
        // Find messages received by the user
        const messages = await MessageModel.findAll({
            where: {
                receiver_id: user_id
            }
        });

        res.status(200).json({
            message: 'Messages received by user retrieved successfully',
            data: messages
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});


export default messageRouter;
