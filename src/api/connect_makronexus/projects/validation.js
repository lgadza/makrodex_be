import { body, check } from 'express-validator';

const validation = [
    body('title').notEmpty().withMessage('Title is required'),
    body('start_date').notEmpty().withMessage('Start date is required'),
    body('owner_id').notEmpty().isUUID().withMessage('Owner ID is required and must be a valid UUID'),
    body('school_id').notEmpty().isUUID().withMessage('School ID is required and must be a valid UUID'),
    body('status').notEmpty().isIn(['ongoing', 'completed']).withMessage('Status is required and must be either ongoing or completed'),
    body('visibility').notEmpty().isIn(['public', 'private', 'group-specific']).withMessage('Visibility is required and must be one of the specified values'),
    body('problems').notEmpty().isArray().withMessage('Problems must be an array'),
    body('problems.*.description').notEmpty().withMessage('Each problem must have a description'),
    body('solutions').notEmpty().isArray().withMessage('Solutions must be an array'),
    body('solutions.*.description').notEmpty().withMessage('Each solution must have a description'),
    body('outcomes').notEmpty().isArray().withMessage('Outcomes must be an array'),
    body('outcomes.*.description').notEmpty().withMessage('Each outcome must have a description'),
];

export default validation;
