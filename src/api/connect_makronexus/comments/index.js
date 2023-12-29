// commentRoutes.js (or wherever you define your routes)

import express from 'express';
import { validationResult } from 'express-validator';
import { validateCommentCreation } from './validation.js';
import CommentModel from './mode.js';
import { asyncHandler } from '../../../middleware/asyncHandler.js';


const commentRouter = express.Router();

// Endpoint to create a new comment
commentRouter.post('/:user_id', validateCommentCreation, asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.params.user_id;
    const { post_id, comment_text } = req.body;

    try {
        // Create a new comment
        const newComment = await CommentModel.create({
            post_id,
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

export default commentRouter;
