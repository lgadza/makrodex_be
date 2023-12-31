import express from 'express';
import { body,param,query, validationResult } from 'express-validator';
import sequelize from '../../../db.js';
import PostModel from './model.js';
import UserModel from '../../users/model.js';
import { validatePost } from './validation.js'; 
import { asyncHandler } from '../../../middleware/asyncHandler.js';

const postRouter = express.Router();

// /posts/:user_id/create-post
// Endpoint to create a new post
postRouter.post('/:user_id/create-post', validatePost, asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { title, content_text, visibility = 'public', location, parent_post_id } = req.body;
    const user_id = req.params.user_id;

    try {
        // Create a new post within a transaction
        const newPost = await sequelize.transaction(async (transaction) => {
            const post = await PostModel.create({
                user_id,
                title,
                content_text,
                visibility,
                parent_post_id,
                status: 'active',
                location
            }, { transaction });

            // If parent_post_id is provided, increment the comments_count of the parent post
            if (parent_post_id) {
                const parentPost = await PostModel.findByPk(parent_post_id, { transaction });
                if (parentPost) {
                    await parentPost.increment('comments_count', { transaction });
                }
            }

            return post;
        });

        res.status(201).json({
            message: 'Post created successfully',
            data: newPost
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
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
            attributes: ['id', 'first_name', 'last_name', 'avatar',"role"]
        }]
    });

    if (!post) {
        return res.status(404).json({ error: 'Post not found' });
    }

    // Get all posts with the same parent_post_id as the current post's id
    const replies = await PostModel.findAll({
        where: {
            parent_post_id: postId,
        },
        include: [{
            model: UserModel,
            as: 'user',
            attributes: ['id', 'first_name', 'last_name', 'avatar',"role"]
        }]
    });

    res.status(200).json({
        post,
        replies,
    });
}));

// Endpoint to get all posts with advanced filters and pagination
postRouter.get('/', [
    query('user_id').optional().isUUID().withMessage('User ID must be an UUID'),
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

    const page = parseInt(req.query.page, 20) || 1;
    const limit = parseInt(req.query.limit, 20) || 20;
    const offset = (page - 1) * limit;

    const filters = {};
    if (req.query.user_id) filters.user_id = req.query.user_id;
    if (req.query.status) filters.status = req.query.status;
    if (req.query.visibility) filters.visibility = req.query.visibility;

    // Add the condition to filter by null parent_post_id
    filters.parent_post_id = null;

    try {
        const { rows: postsWithNoAvatars, count: totalPosts } = await PostModel.findAndCountAll({
            where: filters,
            limit: limit,
            offset: offset,
            include: [{
                model: UserModel,
                as: 'user',
                attributes: ['id', 'first_name', 'last_name', 'avatar',"role"]
            }],
            order: [['createdAt', 'DESC']], 
        });
        const posts = await Promise.all(postsWithNoAvatars.map(async (post) => {
            if (post.comments_count > 0) {
                const comments = await PostModel.findAll({
                    where: { parent_post_id: post.id },
                    include: [{
                        model: UserModel,
                        as: 'user',
                        attributes: ['avatar']
                    }],
                });

                // Extract avatars from comments
                const avatars = comments.map(comment => comment.user.avatar);

                return { ...post.toJSON(), replyAvatars: avatars };
            } else {
                return post.toJSON();
            }
        }));
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
        // Perform the operation within a transaction
        await sequelize.transaction(async (transaction) => {
            const post = await PostModel.findByPk(postId, { transaction });
            if (!post) {
                return res.status(404).json({ error: 'Post not found' });
            }

            // Ensure the user is authorized to delete the post
            if (post.user_id !== userId) {
                return res.status(403).json({ error: 'Unauthorized to delete this post' });
            }

            // If the post is a comment (has a parent_post_id), decrement the parent post's comments_count
            if (post.parent_post_id) {
                const parentPost = await PostModel.findByPk(post.parent_post_id, { transaction });
                if (parentPost) {
                    await parentPost.decrement('comments_count', { transaction });
                }
            }

            // Delete the post
            await post.destroy({ transaction });
        });

        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}));



export default postRouter;
