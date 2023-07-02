import express from "express";
import multer from "multer";
import cloudinary from "../lib/cloudinary";
import FileUploadModel from "./model";

const fileRouter = express.FileRouter();
const upload = multer({ dest: 'uploads/' });

// Get all files
fileRouter.get(':applicant_id/', async (req, res) => {
  try {
    const files = await FileUploadModel.findAll();
    res.json(files);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch files' });
  }
});

// Get one file by ID
fileRouter.get('/:applicant_id/file_id', async (req, res) => {
  try {
    const file = await FileUploadModel.findByPk(req.params.id);
    if (!file) {
      res.status(404).json({ error: 'File not found' });
    } else {
      res.json(file);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch file' });
  }
});

// Upload one file
fileRouter.post('/:applicant_id', upload.single('file'), async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path);
    const file = await FileUploadModel.create({
      filename: req.file.originalname,
      url: result.secure_url,
    });
    res.status(201).json(file);
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Upload multiple files
fileRouter.post('/:applicant_id/multiple', upload.array('files', 10), async (req, res) => {
  try {
    const uploadPromises = req.files.map((file) =>
      cloudinary.uploader.upload(file.path)
    );
    const results = await Promise.all(uploadPromises);
    const files = await FileUploadModel.bulkCreate(
      results.map((result, index) => ({
        filename: req.files[index].originalname,
        url: result.secure_url,
      }))
    );
    res.status(201).json(files);
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload files' });
  }
});

// Delete a file by ID
fileRouter.delete('/:applicant_id/file_id', async (req, res) => {
  try {
    const file = await FileUploadModel.findByPk(req.params.id);
    if (!file) {
      res.status(404).json({ error: 'File not found' });
    } else {
      await cloudinary.uploader.destroy(file.filename);
      await file.destroy();
      res.status(204).send();
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

export default fileRouter;
