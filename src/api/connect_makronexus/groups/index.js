import express from 'express';
import { body, validationResult, param,query } from 'express-validator';
import GroupModel from './model.js'; 
import { asyncHandler } from '../../../middleware/asyncHandler.js'; 
import UserModel from '../../users/model.js';

const groupRouter = express.Router();

// Endpoint to create a new group
groupRouter.post('/:user_id', [
    param('user_id').isUUID().withMessage('Invalid user ID'), 
    body('group_name').notEmpty().withMessage('Group name is required'),
    body('description').optional().trim(),
    body('group_privacy_setting').isIn(['private', 'public']).withMessage('Invalid privacy setting'),
    // Additional validations can be added here
], asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: formatErrors(errors.array()) });
    }

    const userId = req.params.user_id;
    const { group_name, description, group_privacy_setting } = req.body;

    try {
        const newGroup = await GroupModel.create({
            group_name,
            description,
            group_privacy_setting,
            group_owner_id: userId
        });

        res.status(201).json({
            message: 'Group created successfully',
            data: newGroup
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
}));

// Utility function for formatting errors
function formatErrors(errors) {
    return errors.map(err => ({ field: err.param, message: err.msg }));
}
// Endpoint to update a group
groupRouter.put('/:user_id/:group_id', [
    param('user_id').isUUID().withMessage('Invalid user ID'), 
    param('group_id').isUUID().withMessage('Invalid group ID format'),
    body('group_name').optional().notEmpty().withMessage('Group name cannot be empty'),
    body('description').optional().trim(),
    body('group_privacy_setting').optional().isIn(['private', 'public']).withMessage('Invalid privacy setting'),
    // Additional validations can be added as needed
], asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const groupId = req.params.group_id;
    const userId =req.params.user_id;
    const { group_name, description, group_privacy_setting } = req.body;

    try {
        const group = await GroupModel.findByPk(groupId);
        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        // Check if the current user is the group owner
        if (group.group_owner_id !== userId) {
            return res.status(403).json({ error: 'Unauthorized to update this group' });
        }

        // Update the group
        await group.update({ group_name, description, group_privacy_setting });

        res.status(200).json({ message: 'Group updated successfully', data: group });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}));


// Endpoint to delete a group
groupRouter.delete('/:user_id/:group_id', [
    param('user_id').isUUID().withMessage('Invalid user ID'), 
    param('group_id').isUUID().withMessage('Invalid group ID format'),
], asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const groupId = req.params.group_id;
    const userId = req.params.user_id;

    try {
        const group = await GroupModel.findByPk(groupId);
        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        // Check if the current user is the group owner
        if (group.group_owner_id !== userId) {
            return res.status(403).json({ error: 'Unauthorized to delete this group' });
        }

        // Delete the group
        await group.destroy();

        res.status(200).json({ message: 'Group deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}));
// Endpoint to list groups with optional filters
groupRouter.get('/', [
    query('group_name').optional().trim(),
    query('group_privacy_setting').optional().isIn(['private', 'public']).withMessage('Invalid privacy setting'),
    query('group_owner_id').optional().isUUID().withMessage('Invalid owner ID format'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1 }).withMessage('Limit must be a positive integer'),
    // Additional query parameters can be added as needed
], asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const filters = {};
    if (req.query.group_name) filters.group_name = req.query.group_name;
    if (req.query.group_privacy_setting) filters.group_privacy_setting = req.query.group_privacy_setting;
    if (req.query.group_owner_id) filters.group_owner_id = req.query.group_owner_id;

    try {
        const { rows: groups, count: totalGroups } = await GroupModel.findAndCountAll({
            where: filters,
            limit: limit,
            offset: offset,
            order: [['creation_date', 'DESC']], // Sorting by creation date
        });

        const totalPages = Math.ceil(totalGroups / limit);

        res.status(200).json({
            pagination: {
                totalGroups,
                totalPages,
                currentPage: page,
                limit
            },
            groups
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}));

// Endpoint to get details of a specific group
groupRouter.get('/:group_id', [
    param('group_id').isUUID().withMessage('Invalid group ID format'),
], asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const groupId = req.params.group_id;

    try {
        const group = await GroupModel.findByPk(groupId, {
            include: [{
                model: UserModel,
                as: 'groupOwner',
                attributes: ['id', 'first_name',"last_name","avatar"] 
            }]
        });

        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        res.status(200).json(group);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}));
export default groupRouter;
