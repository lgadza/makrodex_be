import { body } from 'express-validator';
import PostModel from '../posts/model.js';

const validateCommentCreation = [
    body('post_id')
        .isUUID().withMessage('Post ID must be a valid UUID')
        .custom(async (value) => {
            const post = await PostModel.findByPk(value);
            if (!post) {
                return Promise.reject('Post not found');
            }
        }),
    body('comment_text')
        .notEmpty().withMessage('Comment text cannot be empty')
        .trim()
        .isLength({ max: 1000 }).withMessage('Comment text must be less than 1000 characters'),
    // Additional validations can be added as needed
];

export { validateCommentCreation };
