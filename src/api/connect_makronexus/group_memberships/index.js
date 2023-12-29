import express from 'express';
import { validationResult, param, body } from 'express-validator';
import GroupModel from '../groups/model.js';
import GroupMembershipModel from './model.js';
import { asyncHandler } from '../../../middleware/asyncHandler.js';


const groupMembershipRouter = express.Router();

// Endpoint to add a member to a group from a join request
groupMembershipRouter.post('/:user_id/:group_id/:sender_user_id', [
    param('group_id').isUUID().withMessage('Invalid group ID format'),
    param('user_id').isUUID().withMessage('Invalid sender_user_id ID format'),
    param('sender_user_id').isUUID().withMessage('Invalid sender_user_id ID format'),
], asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const groupId = req.params.group_id;
    const senderUserId = req.params.sender_user_id;
    const currentUserId = req.params.user_id; 

    try {
        // Check if the current user is authorized (group admin or owner)
        const group = await GroupModel.findByPk(groupId);
        if (!group || group.group_owner_id !== currentUserId) {
            return res.status(403).json({ error: 'Unauthorized to add members to this group' });
        }

        // Find the pending group join request
        const joinRequest = await RequestModel.findOne({
            where: {
                group_id: groupId,
                request_type: "group_join",
                sender_user_id: senderUserId,
                request_status: "pending"
            }
        });

        if (!joinRequest) {
            return res.status(404).json({ error: 'No pending join request found for this group' });
        }

        // Add the user as a member of the group
        const newMember = await GroupMembershipModel.create({
            group_id: groupId,
            user_id: joinRequest.sender_user_id,
            member_role: 'Member' // Default role
        });

        // Update the join request status to accepted
        await joinRequest.update({ request_status: RequestStatus.ACCEPTED });

        res.status(201).json({
            message: 'Member added successfully',
            data: newMember
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}));

export default groupMembershipRouter;