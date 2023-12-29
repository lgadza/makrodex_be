import express from 'express';
import { validationResult, param, body } from 'express-validator';
import GroupModel from '../groups/model.js';
import GroupMembershipModel from './model.js';
import { asyncHandler } from '../../../middleware/asyncHandler.js';
import RequestModel from '../requests/model.js';
import UserModel from '../../users/model.js';


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
        await joinRequest.update({ request_status: "accepted" });

        res.status(201).json({
            message: 'Member added successfully',
            data: newMember
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}));


// Endpoint for a user to leave a group and update request status
groupMembershipRouter.delete('/:groupId/leave-group/:userId', [
    param('groupId').isUUID().withMessage('Invalid group ID format'),
    param('userId').isUUID().withMessage('Invalid User ID format'),
], asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const groupId = req.params.groupId;
    const userId = req.params.userId;

    try {
        // Find and update the group join request, if it exists
        const joinRequest = await RequestModel.findOne({
            where: {
                group_id: groupId,
                sender_user_id: userId,
                request_type: "group_join"
                //  checking for both PENDING and ACCEPTED statuses if needed
            }
        });

        if (joinRequest) {
            await joinRequest.update({ request_status: "declined" });
        }

        // Find the group membership record
        const membership = await GroupMembershipModel.findOne({
            where: { group_id: groupId, user_id: userId }
        });

        if (!membership) {
            return res.status(404).json({ error: 'Group membership not found' });
        }

        // Remove the user from the group
        await membership.destroy();

        res.status(200).json({ message: 'Successfully left the group and request status updated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}));

// Endpoint to remove a member from a group and update request status
groupMembershipRouter.delete('/:user_id/:group_id/:member_id', [
    param('user_id').isUUID().withMessage('Invalid user ID format'),
    param('group_id').isUUID().withMessage('Invalid group ID format'),
    param('member_id').isUUID().withMessage('Invalid member ID format'),
], asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const groupId = req.params.group_id;
    const currentUserId = req.params.user_id;
    const memberId = req.params.member_id;

    try {
        // Check if the current user is authorized (group admin or owner)
        const group = await GroupModel.findByPk(groupId);
        if (!group || group.group_owner_id !== currentUserId) {
            return res.status(403).json({ error: 'Unauthorized to remove members from this group' });
        }

        // Find and update the group join request, if it exists
        const joinRequest = await RequestModel.findOne({
            where: {
                group_id: groupId,
                sender_user_id: memberId,
                request_type: 'group_join',
                // request_status: "accepted"
            }
        });
        if (joinRequest) {
            await joinRequest.update({ request_status: "declined" });
        }

        // Remove the member from the group
        const membership = await GroupMembershipModel.findOne({
            where: {
                group_id: groupId,
                user_id: memberId
            }
        });
        if (membership) {
            await membership.destroy();
            res.status(200).json({ message: 'Member removed and request status updated successfully' });
        } else {
            res.status(404).json({ error: 'Group membership not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}));
// Endpoint to list all members of a group
groupMembershipRouter.get('/:groupId/members', [
    param('groupId').isUUID().withMessage('Invalid group ID format'),
], asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const groupId = req.params.groupId;
    const page = parseInt(req.query.page, 10) || 1;  // Default to page 1 if not specified
    const limit = parseInt(req.query.limit, 10) || 10;  // Default to 10 records per page
    const offset = (page - 1) * limit;

    try {
        const { count, rows } = await GroupMembershipModel.findAndCountAll({
            where: { group_id: groupId },
            include: [{
                model: UserModel,
                as: 'user',
                attributes: ['id', 'first_name', 'last_name', 'avatar']
            }],
            limit,
            offset,
            order: [['createdAt', 'ASC']]
        });

        res.status(200).json({
            message: 'Group members retrieved successfully',
            data: rows,
            pagination: {
                total: count,
                perPage: limit,
                currentPage: page,
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}));




export default groupMembershipRouter;