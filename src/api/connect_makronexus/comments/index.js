// commentRoutes.js (or wherever you define your routes)

import express from 'express';
import { validationResult,param,query,body } from 'express-validator';
import { validateCommentCreation } from './validation.js';
import CommentModel from './mode.js';
import { asyncHandler } from '../../../middleware/asyncHandler.js';
import UserModel from '../../users/model.js';


const commentRouter = express.Router();

// Endpoint to create a new comment
commentRouter.post('/:user_id', validateCommentCreation, asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.params.user_id;
    const { project_id, comment_text } = req.body;

    try {
        // Create a new comment
        const newComment = await CommentModel.create({
            project_id,
            user_id: userId,
            comment_text
        });

        res.status(201).json({
            message: 'Comment created successfully',
            data: newComment
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}));
// Endpoint to get a single comment by ID
commentRouter.get('/:id', [
    param('id').isUUID().withMessage('Invalid comment ID format'),
], asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const commentId = req.params.id;

    try {
        const comment = await CommentModel.findByPk(commentId, {
            include: [{ model: UserModel, as: 'user', attributes: ['id', 'first_name', 'last_name', 'avatar'] }]
        });

        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        res.status(200).json(comment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}));
// Endpoint to get comments with optional filters

commentRouter.get('/', [
    query('project_id').isUUID().withMessage('Post ID must be a valid UUID'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1 }).withMessage('Limit must be a positive integer'),
    // Additional query parameters can be added as needed for further filtering
], asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const project_id = req.query.project_id;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    try {
        const { rows: comments, count: totalComments } = await CommentModel.findAndCountAll({
            where: { project_id: project_id },
            limit: limit,
            offset: offset,
            include: [{
                model: UserModel,
                as: 'user',
                attributes: ['id', 'first_name', 'last_name', 'avatar']
            }],
            order: [['createdAt', 'DESC']], // Sorting by the timestamp
        });

        const totalPages = Math.ceil(totalComments / limit);

        res.status(200).json({
            comments,
            pagination: {
                totalComments,
                totalPages,
                currentPage: page,
                limit
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}));
// Endpoint to update a comment
commentRouter.put('/:user_id/:id', [
    param('id').isUUID().withMessage('Invalid comment ID format'),
    body('comment_text').notEmpty().withMessage('Comment text cannot be empty')
        .trim()
        .isLength({ max: 1000 }).withMessage('Comment text must be less than 1000 characters'),
    // Additional validations can be added as needed
], asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const commentId = req.params.id;
    const { comment_text } = req.body;
    const userId = req.params.user_id;

    try {
        const comment = await CommentModel.findByPk(commentId);
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        // Additional security check: Ensure the user is authorized to update the comment
        const currentUserId = userId;
        if (comment.user_id !== currentUserId) {
            return res.status(403).json({ error: 'Unauthorized to update this comment' });
        }

        // Update the comment
        await comment.update({ comment_text });

        res.status(200).json({ message: 'Comment updated successfully', data: comment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}));
// Endpoint to delete a comment
commentRouter.delete('/:user_id/:id', [
    param('id').isUUID().withMessage('Invalid comment ID format'),
], asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const commentId = req.params.id;
    const userId = req.params.user_id;

    try {
        const comment = await CommentModel.findByPk(commentId);
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        // Additional security check: Ensure the user is authorized to delete the comment
        const currentUserId = userId;
        if (comment.user_id !== currentUserId) {
            return res.status(403).json({ error: 'Unauthorized to delete this comment' });
        }
        // Delete the comment
        await comment.destroy();

        res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}));

export default commentRouter;
