import express from 'express';
import { body, validationResult,param } from 'express-validator';
import RequestModel, { RequestType, RequestStatus } from './model.js'; 
import { asyncHandler } from '../../../middleware/asyncHandler.js'; // Adjust the path as needed

const requestRouter = express.Router();

// Endpoint to send a request
requestRouter.post('/:user_id/send-request', [
    param('user_id').isUUID().withMessage(' User ID must be a valid UUID'),
    body('receiver_user_id').isUUID().withMessage('Receiver User ID must be a valid UUID'),
    body('request_type').isIn(Object.values(RequestType)).withMessage('Invalid request type'),
    // Additional validations can be added here
], asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const senderUserId = req.params.user_id;
    const { receiver_user_id, request_type } = req.body;

    try {
        // Create a new request
        const newRequest = await RequestModel.create({
            sender_user_id: senderUserId,
            receiver_user_id,
            request_type,
            request_status: RequestStatus.PENDING
        });

        res.status(201).json({
            message: 'Request sent successfully',
            data: newRequest
        });
    } catch (error) {
        console.error(error);
        // Handle specific errors (e.g., duplicate requests) as needed
        res.status(500).json({ error: 'Internal Server Error' });
    }
}));

export default requestRouter;
