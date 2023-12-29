// import express from 'express';
// import { body, query, validationResult } from 'express-validator';
// import UserModel from '../../users/model.js';
// import UserSettingsModel from './model.js';



// const userSettingsRouter = express.Router();

// //! Endpoint to create a new userSettings
// userSettingsRouter.post('/create-userSettings', [
//     body('creator_id').isUUID().withMessage('Creator ID must be a valid UUID'),
//     body('userSettings_name').optional().trim().isLength({ max: 255 }).withMessage('UserSettings name must be less than 255 characters'),
// ], async (req, res) => {
//     // Check for validation errors
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//         return res.status(400).json({ errors: errors.array() });
//     }

//     const { creator_id, userSettings_name } = req.body;

//     try {
//           // Validate existence of users
//           const creator = await UserModel.findByPk(creator_id);
//           if (!creator ) {
//             return res.status(404).json({ error: 'Creator id not found' });
//         }
//         // Create a new userSettings
//         const newUserSettings = await UserSettingsModel.create({
//             creator_id,
//             user_settings_name,
//         });

//         res.status(201).json({
//             message: 'UserSettings created successfully',
//             data: newUserSettings
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: error.message || 'Internal Server Error' });
//     }
// });
// export default userSettingsRouter