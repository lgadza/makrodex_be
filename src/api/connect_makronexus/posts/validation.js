import { body,param } from 'express-validator';
import UserModel from '../../users/model.js';

const validatePost = [
    param('user_id')
        .isUUID().withMessage('User ID must be a valid UUID')
        .custom(async (value) => {
            const user = await UserModel.findByPk(value);
            if (!user) {
                return Promise.reject('User not found');
            }
        }),
        body('parent_post_id').optional().isUUID().withMessage('Invalid Parent Post ID format'),
    body('title')
        .optional()
        .trim()
        .isLength({ max: 255 }).withMessage('Title must be less than 255 characters'),
    body('content_text')
        .notEmpty().withMessage('Content text is required'),
    body('visibility')
        .isIn(['public', 'friends', 'private', 'custom']).withMessage('Invalid visibility value'),
    body('status')
        .isIn(['active', 'deleted', 'archived']).withMessage('Invalid status value'),
    body('location')
        .optional()
        .trim()
];

export { validatePost };
