import express from 'express';
import ParticipantModel from './model.js';
import { body, validationResult } from 'express-validator';
import ConversationModel from '../conversations/model.js';
import UserModel from '../../users/model.js';
const messengerParticipantRouter = express.Router();

// GET all participants
messengerParticipantRouter.get('/participants', async (req, res) => {
    try {
        const participants = await ParticipantModel.findAll();
        res.status(200).json(participants);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
messengerParticipantRouter.post('/add-participant', [
    body('user_id').isUUID().withMessage('User ID must be a valid UUID'),
    body('conversation_id').isUUID().withMessage('Conversation ID must be a valid UUID'),
    // body('role').isIn(['member', 'moderator', 'admin']).withMessage('Invalid role')
], async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { user_id, conversation_id, role } = req.body;

    try {
        // Validate existence of user and conversation
        const userExists = await UserModel.findByPk(user_id);
        const conversationExists = await ConversationModel.findByPk(conversation_id);

        if (!userExists) {
            return res.status(404).json({ error: 'User ID not found' });
        }
        if (!conversationExists) {
            return res.status(404).json({ error: 'Conversation ID not found' });
        }

        // Add participant to conversation
        const participant = await ParticipantModel.create({
            user_id,
            conversation_id,
            role
        });

        res.status(201).json({
            message: 'Participant added successfully',
            data: participant
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});
// Delete the participant
messengerParticipantRouter.delete('/remove-participant/:participantId', async (req, res) => {
    const { participantId } = req.params;

    try {
        const participant = await ParticipantModel.findByPk(participantId);

        if (!participant) {
            return res.status(404).json({ error: 'Participant not found' });
        }

        // Delete the participant
        await participant.destroy();

        res.status(200).json({
            message: 'Participant removed successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});
// List Participants in a Conversation
messengerParticipantRouter.get('/conversation-participants/:conversation_id',[body('conversation_id').isUUID().withMessage('Conversation ID must be a valid UUID'),], async (req, res) => {
    const { conversation_id } = req.params;

    

    try {
        const participants = await ParticipantModel.findAll({
            where: { conversation_id: conversation_id }
        });

        if (participants.length === 0) {
            return res.status(404).json({ message: 'No participants found for this conversation' });
        }

        res.status(200).json(participants);
    } catch (error) {
        console.error('Error fetching participants:', error);
        res.status(500).json({ 
            message: 'An error occurred while fetching participants',
            error: error.message // Consider omitting detailed error messages in a production environment.
        });
    }
});
// Add Multiple Participants to a Conversation
messengerParticipantRouter.post('/add-multiple-participants', [
    body('conversation_id').isUUID().withMessage('Conversation ID must be a valid UUID'),
    body('participants').isArray().withMessage('Participants must be an array'),
    body('participants.*.user_id').isUUID().withMessage('Each User ID must be a valid UUID'),
    body('participants.*.role').optional().isIn(['member', 'moderator', 'admin']).withMessage('Invalid role')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { conversation_id, participants } = req.body;

    try {
        const conversationExists = await ConversationModel.findByPk(conversation_id);
        if (!conversationExists) {
            return res.status(404).json({ error: 'Conversation ID not found' });
        }

        // Add each participant
        const addedParticipants = [];
        for (const participant of participants) {
            const newParticipant = await ParticipantModel.create({
                user_id: participant.user_id,
                conversation_id,
                role: participant.role || 'member' // Default to 'member' if role not provided
            });
            addedParticipants.push(newParticipant);
        }

        res.status(201).json({
            message: 'Participants added successfully',
            data: addedParticipants
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});

export default messengerParticipantRouter;
