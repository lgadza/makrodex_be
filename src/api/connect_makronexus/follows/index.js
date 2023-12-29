import express from 'express';
import { body, validationResult,param } from 'express-validator';
import FollowModel from './model.js'; 
import { asyncHandler } from '../../../middleware/asyncHandler.js'; 

const followRouter = express.Router();
// Endpoint to create a new follow relationship
followRouter.post('/:user_id', [
    param('user_id').isUUID().withMessage('User ID must be a valid UUID'),
    body('following_id').isUUID().withMessage('Following ID must be a valid UUID'),
    // Additional validations can be added here
], asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const followerId = req.params.user_id;
    const { following_id } = req.body;

    try {
        // Check if the follow relationship already exists
        const existingFollow = await FollowModel.findOne({
            where: {
                follower_id: followerId,
                following_id
            }
        });

        if (existingFollow) {
            return res.status(409).json({ error: 'Follow relationship already exists' });
        }

        // Create a new follow relationship
        const newFollow = await FollowModel.create({
            follower_id: followerId,
            following_id
        });

        res.status(201).json({
            message: 'Follow relationship created successfully',
            data: newFollow
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}));

// Endpoint to delete a follow relationship
followRouter.delete('/:user_id/:following_id', [
    param('following_id').isUUID().withMessage('Following ID must be a valid UUID'),
], asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const followerId = req.params.user_id;
    const followingId = req.params.following_id;

    try {
        const followRelationship = await FollowModel.findOne({
            where: {
                follower_id: followerId,
                following_id: followingId
            }
        });

        if (!followRelationship) {
            return res.status(404).json({ error: 'Follow relationship not found' });
        }

        // Delete the follow relationship
        await followRelationship.destroy();

        res.status(200).json({ message: 'Follow relationship deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}));


export default followRouter;
