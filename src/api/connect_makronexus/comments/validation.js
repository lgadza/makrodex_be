import { body } from 'express-validator';
import ProjectModel from '../projects/model.js';

const validateCommentCreation = [
    body('project_id')
        .isUUID().withMessage('Project ID must be a valid UUID')
        .custom(async (value) => {
            const post = await ProjectModel.findByPk(value);
            if (!post) {
                return Promise.reject('Project not found');
            }
        }),
    body('comment_text')
        .notEmpty().withMessage('Comment text cannot be empty')
        .trim()
        .isLength({ max: 1000 }).withMessage('Comment text must be less than 1000 characters'),
];

export { validateCommentCreation };
