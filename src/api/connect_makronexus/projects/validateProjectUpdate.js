import { body } from 'express-validator';

const validateProjectUpdate = [
    body('title').optional().isString().withMessage('Title must be a string'),
    body('background').optional().isString().withMessage('Background must be a string'),
    body('start_date').optional().isISO8601().withMessage('Start date must be a valid date'),
    body('end_date').optional().isISO8601().withMessage('End date must be a valid date'),
    body('status').optional().isIn(['ongoing', 'completed']).withMessage('Invalid status value'),
    body('visibility').optional().isIn(['public', 'private', 'group-specific']).withMessage('Invalid visibility value'),
    body('problems').optional().isArray().withMessage('Problems must be an array'),
    body('problems.*.id').optional().isUUID().withMessage('Problem ID must be a valid UUID'),
    body('problems.*.description').optional().isString().withMessage('Problem description must be a string'),
    // Repeat similar validation for solutions and outcomes
    body('solutions').optional().isArray().withMessage('Solutions must be an array'),
    body('solutions.*.id').optional().isUUID().withMessage('Solution ID must be a valid UUID'),
    body('solutions.*.description').optional().isString().withMessage('Solution description must be a string'),
    body('outcomes').optional().isArray().withMessage('Outcomes must be an array'),
    body('outcomes.*.id').optional().isUUID().withMessage('Outcome ID must be a valid UUID'),
    body('outcomes.*.description').optional().isString().withMessage('Outcome description must be a string'),
];

export default validateProjectUpdate;
