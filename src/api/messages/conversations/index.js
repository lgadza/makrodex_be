import express from 'express';
import { body, query, validationResult } from 'express-validator';
import ConversationModel from './model.js';
import UserModel from '../../users/model.js';
import ParticipantModel from '../participants/model.js';
import MessageModel from '../dual_messages/model.js';


const conversationRouter = express.Router();

//! Endpoint to create a new conversation
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
          // Validate existence of users
          const creator = await UserModel.findByPk(creator_id);
          if (!creator ) {
            return res.status(404).json({ error: 'Creator id not found' });
        }
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

//! Endpoint to retrieve conversations
conversationRouter.get('/retrieve-conversations', [
    query('user_id').isUUID().withMessage('User ID must be a valid UUID'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { user_id } = req.query;


    try {
        const user = await UserModel.findByPk(user_id);
        if (!user) {
            return res.status(404).json({ error: 'User id not found' });
        }

        // Retrieve conversations along with participants
       let conversations = await ConversationModel.findAll({
            where: { creator_id: user_id },
            include: [
                {
                model: ParticipantModel,
                as: 'participants', // Ensure this alias is set in your associations
                include: [{
                    model: UserModel,
                    as: 'user', // Alias for user model association
                    attributes: ['id', 'first_name','last_name', 'email',"avatar"], // Select specific user attributes
                }]
            },
            {
                model: MessageModel,
                as: 'lastMessage', // Ensure this alias matches your association
                attributes: ['content', 'read_status'], // Include only the content and read_status
                include: [
                    {
                        model: UserModel,
                        as: 'sender', // Alias for the sender in Message model
                        attributes: ['id', 'first_name', 'last_name']
                    }
                ]
            }
        ]
        });

         // Filter out the user with id == user_id from participants of each conversation
         conversations = conversations.map(conversation => {
            const filteredParticipants = conversation.participants.filter(participant => 
                participant.user_id !== user_id
            );

            return {
                ...conversation.get({ plain: true }),
                participants: filteredParticipants
            };
        });

        res.status(200).json({
            message: 'Conversations retrieved successfully',
            data: conversations
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});

//! Endpoint to update a conversation's name
conversationRouter.put('/update-conversation/:conversation_id', [
    body('conversation_name').trim().isLength({ max: 255 }).withMessage('Conversation name must be less than 255 characters'),
    body('user_id').isUUID().withMessage('User ID must be a valid UUID'),
], async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { conversation_id } = req.params;
    const { conversation_name, user_id } = req.body;

    try {
        // Validate existence of users
        const user = await UserModel.findByPk(user_id);
        if (!user ) {
          return res.status(404).json({ error: 'User id not found' });
      }
        // Check if the user is the creator of the conversation
        const conversation = await ConversationModel.findOne({ where: { conversation_id, creator_id: user_id } });
        if (!conversation) {
            return res.status(404).json({ error: 'Conversation not found or user not authorized' });
        }

        // Update the conversation's name
        conversation.conversation_name = conversation_name;
        await conversation.save();

        res.status(200).json({
            message: 'Conversation updated successfully',
            data: conversation
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});
//! Endpoint to delete a conversation
conversationRouter.delete('/delete-conversation/:user_id/:conversation_id', async (req, res) => {
    const { conversation_id,user_id } = req.params;

    try {
        // Validate existence of users
        const user = await UserModel.findByPk(user_id);
        if (!user ) {
          return res.status(404).json({ error: 'User id not found' });
      }
        // Check if the user is the creator of the conversation
        const conversation = await ConversationModel.findOne({ where: { conversation_id, creator_id: user_id } });
        if (!conversation) {
            return res.status(404).json({ error: 'Conversation not found or user not authorized' });
        }

        // Delete the conversation
        await conversation.destroy();

        res.status(200).json({
            message: 'Conversation deleted successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});
//! Endpoint to add a user || users to a conversation
conversationRouter.post('/add-user-to-conversation/:conversation_id', [
    body('user_id').isUUID().withMessage('User ID must be a valid UUID'),
    body('participants').isArray().withMessage('Participants must be an array'),
    body('participants.*.participant_id').isUUID().withMessage('Each Participant ID must be a valid UUID'),
    body('participants.*.role').optional().isIn(['member', 'moderator', 'admin']).withMessage('Invalid role'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { conversation_id } = req.params;
    const { user_id, participants } = req.body;

    try {
        // Check if the user is the creator or an admin of the conversation
        const conversation = await ConversationModel.findByPk(conversation_id);
        const isCreator = conversation && conversation.creator_id === user_id;
        // const isAdmin = /* Additional logic to check if the user is an admin in the conversation */
        const isAuthorized = isCreator;

        if (!isAuthorized) {
            return res.status(403).json({ error: 'Not authorized to add participants to this conversation' });
        }
         // Verify if each participant_id corresponds to a valid user and is unique in the conversation
         const participantIds = participants.map(p => p.participant_id);
         const uniqueParticipantIds = [...new Set(participantIds)]; // Remove duplicates
         const existingUsers = await UserModel.findAll({ where: { id: uniqueParticipantIds } });
 
         if (existingUsers.length !== uniqueParticipantIds.length) {
             return res.status(400).json({ error: 'One or more participant IDs are invalid' });
         }
              // Check for existing participants in the conversation to avoid duplicates
        const existingParticipants = await ParticipantModel.findAll({
            where: {
                conversation_id,
                user_id: uniqueParticipantIds
            }
        });

        if (existingParticipants.length > 0) {
            return res.status(400).json({ error: 'One or more participants are already in the conversation' });
        }

    // Add each user as a participant to the conversation
    await Promise.all(uniqueParticipantIds.map(participantId => {
        const participant = participants.find(p => p.participant_id === participantId);
        return ParticipantModel.create({
            conversation_id,
            user_id: participantId,
            role: participant.role || 'member'
        });
    }));

    res.status(201).json({
        message: 'Participants added to conversation successfully',
    });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});
//! Endpoint to retrieve a single conversation
conversationRouter.get('/get-conversation/:conversation_id', [
    query('conversation_id').isUUID().withMessage('Conversation ID must be a valid UUID'),
], async (req, res) => {
    const { conversation_id } = req.params;

    try {
        // Retrieve the conversation with the specified ID, including its participants
        const conversation = await ConversationModel.findByPk(conversation_id, {
            include: [
                {
                model: ParticipantModel,
                as: 'participants',
                include: [{
                    model: UserModel,
                    as: 'user',
                    attributes: ['id', 'first_name', 'last_name', 'email']
                }]
            }
        ]
        });

        if (!conversation) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        res.status(200).json({
            message: 'Conversation retrieved successfully',
            data: conversation
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});

export default conversationRouter;
