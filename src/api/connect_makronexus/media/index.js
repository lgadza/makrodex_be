import express from 'express';
import multer from 'multer';
import { validationResult, param } from 'express-validator';
import { asyncHandler } from '../../../middleware/asyncHandler.js';
import MediaModel from './model.js';
import PostModel from '../posts/model.js';
import { uploadFileToS3 } from '../../../s3Service.js';
import ProjectModel from '../projects/model.js';

const mediaRouter = express.Router();
const upload = multer({
    storage: multer.memoryStorage(),
    // limits: {
    //     fileSize: 1024 * 1024 * 20, // 20 MB limit
    // },
});

// Endpoint to add media to a post with S3 upload
mediaRouter.post('/:postId/add-media', upload.single('media'), [
    param('postId').isUUID().withMessage('Invalid Post ID format'),
], asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const postId = req.params.postId;
    const file = req.file;
    if (!file) {
        return res.status(400).json({ error: 'No file provided' });
    }

    try {
        // Check if the post exists
        const post = await PostModel.findByPk(postId);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Upload the media file to S3
        const folderName = 'post-media'; 
        const mediaUrl = await uploadFileToS3(file.buffer, file.originalname, folderName, file.mimetype);
        
        // Add media to the post
        const newMedia = await MediaModel.create({
            post_id: postId,
            media_url: mediaUrl,
            media_type: file.mimetype.startsWith('image') ? 'image' : 'video',
            thumbnail_url: null // Set this accordingly if needed
        });
        

        res.status(201).json({
            message: 'Media uploaded and added to post successfully',
            data: newMedia
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}));
// Endpoint to add multiple media files to a project with S3 upload
mediaRouter.post('/:project_id/add-multiple-media', upload.array('media', 5), [ // Change to handle multiple files
    param('project_id').isUUID().withMessage('Invalid Project ID format'),
], asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    
    const project_id = req.params.project_id;
    console.log(project_id,"project ID")
    const files = req.files; 
    if (!files || files.length === 0) {
        return res.status(400).json({ error: 'No files provided' });
    }

    try {
        // Check if the project exists
        const project = await ProjectModel.findByPk(project_id);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // Process each file
        const mediaResponses = [];
        for (const file of files) {
            const folderName = 'project-media'; 
            const mediaUrl = await uploadFileToS3(file.buffer, file.originalname, folderName, file.mimetype);
            // Add media to the project
            const newMedia = await MediaModel.create({
                project_id: project_id,
                media_url: mediaUrl,
                media_type: file.mimetype.startsWith('image') ? 'image' : 'video',
                thumbnail_url: null 
            });
            mediaResponses.push(newMedia);
        }

        res.status(201).json({
            message: 'Media uploaded and added to project successfully',
            data: mediaResponses
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}));

export default mediaRouter;
