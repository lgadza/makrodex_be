import express from 'express';
import { body, validationResult, param, query } from 'express-validator';
import RequestModel, { RequestType, RequestStatus } from './model.js'; 
import { asyncHandler } from '../../../middleware/asyncHandler.js'; 
import GroupModel from '../groups/model.js';
import UserModel from '../../users/model.js';
import GroupMembershipModel from '../group_memberships/model.js';
const requestRouter = express.Router();

// Endpoint to send a request
requestRouter.post('/:user_id', [
    param('user_id').isUUID().withMessage('User ID must be a valid UUID'),
    body('target_id').isUUID().withMessage('Target ID must be a valid UUID'),
    body('request_type').isIn(Object.values(RequestType)).withMessage('Invalid request type'),
    
], asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const senderUserId = req.params.user_id;
    const { target_id, request_type } = req.body;
    const requestDetails = {
        sender_user_id: senderUserId,
        request_type,
        request_status: RequestStatus.PENDING
    };

    
    if (request_type === RequestType.FRIEND) {
        requestDetails.receiver_user_id = target_id;
    } else if (request_type === RequestType.GROUP_JOIN) {
        requestDetails.group_id = target_id;
    }

    try {
        // Create a new request
        const newRequest = await RequestModel.create(requestDetails);

        res.status(201).json({
            message: 'Request sent successfully',
            data: newRequest
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}));
// Endpoint for a group admin/owner to invite a user to join the group
// requestRouter.post('/:sender_user_id/:groupId/invite-user', [
//     param('sender_user_id').isUUID().withMessage('Invalid sender_user_id format'),
//     param('groupId').isUUID().withMessage('Invalid group ID format'),
//     body('user_id').isUUID().withMessage('Invalid user ID format'),
// ], asyncHandler(async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//         return res.status(400).json({ errors: errors.array() });
//     }

//     const groupId = req.params.groupId;
//     const currentUserId = req.params.sender_user_id; 
//     const { user_id } = req.body;

//     try {
//         // Check if the current user is authorized (group admin or owner)
//         const group = await GroupModel.findByPk(groupId);
//         if (!group || group.group_owner_id !== currentUserId) {
//             return res.status(403).json({ error: 'Unauthorized to invite users to this group' });
//         }

//         // Create a new invitation request
//         const newInvitation = await RequestModel.create({
//             sender_user_id: currentUserId,
//             receiver_user_id: user_id,
//             group_id: groupId,
//             request_type: "group_join",
//             request_status:"pending"
//         });

//         res.status(201).json({
//             message: 'User invited to join the group successfully',
//             data: newInvitation
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// }));
requestRouter.post('/:sender_user_id/:groupId/invite-user', [
    param('sender_user_id').isUUID().withMessage('Invalid sender_user_id format'),
    param('groupId').isUUID().withMessage('Invalid group ID format'),
    body('user_ids').isArray().withMessage('user_ids must be an array'),
    body('user_ids.*').isUUID().withMessage('Each user ID must be a valid UUID'),
], asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const groupId = req.params.groupId;
    const currentUserId = req.params.sender_user_id;
    const { user_ids } = req.body;

    try {
        const group = await GroupModel.findByPk(groupId);
        if (!group || group.group_owner_id !== currentUserId) {
            return res.status(403).json({ error: 'Unauthorized to invite users to this group' });
        }

        // Prepare invitation requests for bulk creation
        const invitationRequests = user_ids.map(userId => ({
            sender_user_id: currentUserId,
            receiver_user_id: userId,
            group_id: groupId,
            request_type: "group_join",
            request_status: "pending"
        }));

        // Create multiple invitation requests in one operation
        const newInvitations = await RequestModel.bulkCreate(invitationRequests);

        res.status(201).json({
            message: 'Users invited to join the group successfully',
            data: newInvitations
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}));


// Endpoint to accept/decline a request


requestRouter.put('/:user_id/:request_id', [
    param('request_id').isUUID().withMessage('Invalid request ID format'),
    param('user_id').isUUID().withMessage('Invalid User ID format'),
    body('request_status').isIn([RequestStatus.ACCEPTED, RequestStatus.DECLINED]).withMessage('Invalid request status'),
], asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const currentUserId = req.params.user_id;
    const requestId = req.params.request_id;
    const { request_status } = req.body;

    try {
        const request = await RequestModel.findByPk(requestId);
        if (!request) {
            return res.status(404).json({ error: 'Request not found' });
        }

        if (request.request_type === RequestType.GROUP_JOIN) {
            const group = await GroupModel.findByPk(request.group_id);
            if (!group || group.group_owner_id !== currentUserId) {
                return res.status(403).json({ error: 'Unauthorized to respond to this group join request' });
            }

            if (request_status === RequestStatus.ACCEPTED) {
                // Check if the user is already a member
                const existingMembership = await GroupMembershipModel.findOne({
                    where: { group_id: request.group_id, user_id: request.sender_user_id }
                });

                if (!existingMembership) {
                    // Add the user to the group if not already a member
                    await GroupMembershipModel.create({
                        group_id: request.group_id,
                        user_id: request.sender_user_id,
                        member_role: 'Member' // or any other default role
                    });
                }
            }
        } else if (request.request_type === RequestType.FRIEND && request.receiver_user_id !== currentUserId) {
            return res.status(403).json({ error: 'Unauthorized to respond to this friend request' });
        }

        // Update the request status regardless of the type
        await request.update({ request_status });

        res.status(200).json({
            message: `Request ${request_status} successfully`,
            data: request
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}));


// Endpoint to list requests for a user or a group
requestRouter.get('/:user_id', [
    param('user_id').isUUID().withMessage('Invalid User ID format'),
    query('type').optional().isIn(Object.values(RequestType)).withMessage('Invalid request type'),
    query('direction').optional().isIn(['incoming', 'outgoing']).withMessage('Invalid request direction'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be a positive integer'),
    query('isGroup').optional().isBoolean().withMessage('isGroup must be a boolean'),
], asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.params.user_id;
    const { type, direction, page = 1, limit = 10, isGroup = false } = req.query;
    const offset = (page - 1) * limit;

    try {
        let whereClause = {};
        if (isGroup) {
            // Handling requests for groups
            whereClause = {
                group_id: userId,
                ...(type && { request_type: type })
            };
        } else {
            // Handling requests for individual users
            whereClause = {
                [direction === 'incoming' ? 'receiver_user_id' : 'sender_user_id']: userId,
                ...(type && { request_type: type })
            };
        }

        const { rows: requests, count: totalRequests } = await RequestModel.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            order: [['request_date', 'DESC']], // Sorting by request date
        });

        const totalPages = Math.ceil(totalRequests / limit);

        res.status(200).json({
            pagination: {
                totalRequests,
                totalPages,
                currentPage: page,
                limit
            },
            requests,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}));
// Endpoint to view all pending join requests for a group
requestRouter.get('/:user_id/:groupId/pending-requests', [
    param('groupId').isUUID().withMessage('Invalid group ID format'),
    param('user_id').isUUID().withMessage('Invalid user ID format'),
], asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const groupId = req.params.groupId;
    const currentUserId = req.params.user_id; // Function to get the current user's ID

    try {
        // Check if the current user is authorized (group admin or owner)
        const group = await GroupModel.findByPk(groupId);
        if (!group || group.group_owner_id !== currentUserId) {
            return res.status(403).json({ error: 'Unauthorized to view requests for this group' });
        }

        // Retrieve all pending join requests for the group
        const pendingRequests = await RequestModel.findAll({
            where: {
                group_id: groupId,
                request_type: RequestType.GROUP_JOIN,
                request_status: RequestStatus.PENDING
            },
            order: [['createdAt', 'ASC']], // Sorting by request date
            
            include: [
                        {
                            model: UserModel,
                            as: 'sender',
                            attributes: ['id', 'first_name',"last_name", 'email',"avatar","role"], 
                        },
                    ],
           
        });

        res.status(200).json(
            // message: 'Pending join requests retrieved successfully',
             pendingRequests
        );
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}));
// Endpoint to cancel a sent request
requestRouter.delete('/:user_id/:request_id', [
    param('user_id').isUUID().withMessage('Invalid User ID format'),
    param('request_id').isUUID().withMessage('Invalid request ID format'),
], asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const requestId = req.params.request_id;
    const currentUserId = req.params.user_id; // Function to get the current user's ID

    try {
        const request = await RequestModel.findByPk(requestId);
        if (!request) {
            return res.status(404).json({ error: 'Request not found' });
        }

        // Check if the current user is the sender of the request
        if (request.sender_user_id !== currentUserId) {
            return res.status(403).json({ error: 'Unauthorized to cancel this request' });
        }

        // Cancel the request
        await request.destroy();

        res.status(200).json({ message: 'Request cancelled successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}));


export default requestRouter;
