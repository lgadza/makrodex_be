import express from 'express';
import { validationResult, param } from 'express-validator';
import PostModel from '../posts/model.js';
import sequelize from '../../../db.js';
import LikeModel from './model.js';
import { asyncHandler } from '../../../middleware/asyncHandler.js';


const likeRouter = express.Router();

// Endpoint to toggle like on a post (like/dislike) and update likes count
likeRouter.post('/:user_id/:postId/toggle-like', [
    param('user_id').isUUID().withMessage('Invalid User ID format'),
    param('postId').isUUID().withMessage('Invalid Post ID format'),
], asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const postId = req.params.postId;
    const userId = req.params.user_id;

    try {
        const post = await PostModel.findByPk(postId);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const existingLike = await LikeModel.findOne({
            where: { post_id: postId, user_id: userId }
        });

        if (existingLike) {
            await sequelize.transaction(async (transaction) => {
                await existingLike.destroy({ transaction });
                await post.decrement('likes_count', { transaction });
            });
            res.status(200).json({ message: 'Like removed successfully' });
        } else {
            await sequelize.transaction(async (transaction) => {
                await LikeModel.create({ post_id: postId, user_id: userId }, { transaction });
                await post.increment('likes_count', { transaction });
            });
            res.status(201).json({ message: 'Like added successfully' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}));

export default likeRouter;
