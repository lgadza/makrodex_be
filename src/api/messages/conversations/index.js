import express from 'express';
import { body, validationResult } from 'express-validator';
import ConversationModel from './model.js';


const conversationRouter = express.Router();

// Endpoint to create a new conversation
conversationRouter.post('/create-conversation', [
    body('creator_id').isUUID().withMessage('Creator ID must be a valid UUID'),
    body('conversation_name').optional().trim().isLength({ max: 255 }).withMessage('Conversation name must be less than 255 characters'),
], async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { creator_id, conversation_name } = req.body;

    try {
        // Create a new conversation
        const newConversation = await ConversationModel.create({
            creator_id,
            conversation_name,
        });

        res.status(201).json({
            message: 'Conversation created successfully',
            data: newConversation
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});

export default conversationRouter;
