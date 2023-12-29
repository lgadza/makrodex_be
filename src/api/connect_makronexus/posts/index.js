import express from 'express';
import { body,param,query, validationResult } from 'express-validator';
import sequelize from '../../../db.js';
import PostModel from './model.js';
import UserModel from '../../users/model.js';
import { validatePost } from './validation.js'; 
import { asyncHandler } from '../../../middleware/asyncHandler.js';

const postRouter = express.Router();
export function getCurrentUserId(req) {
    // Check if the user object exists in the request
    console.log(req, "TEATVAUDVVBKHIJ")
    if (!req.user || !req.user.id) {
        throw new Error('User is not authenticated');
    }

    // Return the user's ID
    return req.user.id;
}


postRouter.post('/create-post', validatePost, asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { user_id, title, content_text, visibility, status, location } = req.body;

    const newPost = await sequelize.transaction(async (transaction) => {
        return await PostModel.create({
            user_id, title, content_text, visibility, status, location,
        }, { transaction });
    });

    res.status(201).json({
        message: 'Post created successfully',
        data: newPost
    });
}));

// Endpoint to get a single post by ID
postRouter.get('/:id', [
    param('id').isUUID().withMessage('Invalid post ID format'),
], asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const postId = req.params.id;

    const post = await PostModel.findByPk(postId, {
        include: [{
            model: UserModel,
            as: 'user',
            attributes: ['id', 'first_name',"last_name","avatar"] 
        }]
    });

    if (!post) {
        return res.status(404).json({ error: 'Post not found' });
    }

    res.status(200).json(post);
}));
// Endpoint to get all posts with advanced filters and pagination
postRouter.get('/', [
    query('user_id').optional().isInt().withMessage('User ID must be an integer'),
    query('status').optional().isIn(['active', 'deleted', 'archived']).withMessage('Invalid status value'),
    query('visibility').optional().isIn(['public', 'friends', 'private', 'custom']).withMessage('Invalid visibility value'),
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
    if (req.query.user_id) filters.user_id = req.query.user_id;
    if (req.query.status) filters.status = req.query.status;
    if (req.query.visibility) filters.visibility = req.query.visibility;

    try {
        const { rows: posts, count: totalPosts } = await PostModel.findAndCountAll({
            where: filters,
            limit: limit,
            offset: offset,
            include: [{
                model: UserModel,
                as: 'user',
                attributes: ['id', 'first_name', 'last_name', 'avatar']
            }],
            order: [['createdAt', 'DESC']], // Sorting by the creation date
        });

        const totalPages = Math.ceil(totalPosts / limit);

        res.status(200).json({
           
            pagination: {
                totalPosts,
                totalPages,
                currentPage: page,
                limit
            },
            posts,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}));
// Endpoint to update a post
postRouter.put('/update-post/:user_id/:id', [
    param('id').isUUID().withMessage('Invalid post ID format'),
    body('title').optional().trim().isLength({ max: 255 }).withMessage('Title must be less than 255 characters'),
    body('content_text').optional().notEmpty().withMessage('Content text cannot be empty'),
    body('visibility').optional().isIn(['public', 'friends', 'private', 'custom']).withMessage('Invalid visibility value'),
    body('status').optional().isIn(['active', 'deleted', 'archived']).withMessage('Invalid status value'),
    body('location').optional().trim(),
    // Additional validations can be added here
], asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const postId = req.params.id;
    const userId = req.params.user_id;
    const updateData = req.body;

    try {
      

        const post = await PostModel.findByPk(postId);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        const currentUserId = userId;
        if (post.user_id !== currentUserId) {
            return res.status(403).json({ error: 'Unauthorized to update this post' });
        }

        // Update the post
        await post.update(updateData);

        res.status(200).json({ message: 'Post updated successfully', data: post });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}));

// Endpoint to delete a post
postRouter.delete('/delete-post/:user_id/:id', [
    param('id').isUUID().withMessage('Invalid post ID format'),
], asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const postId = req.params.id;
    const userId = req.params.user_id;

    try {
        const post = await PostModel.findByPk(postId);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Additional security check: Ensure the user is authorized to delete the post
        const currentUserId = userId;
        if (post.user_id !== currentUserId) {
            return res.status(403).json({ error: 'Unauthorized to update this post' });
        }


        // Delete the post
        await post.destroy();

        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}));




export default postRouter;
