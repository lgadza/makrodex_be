import express from "express";
import multer from "multer";
import cloudinary from "../lib/cloudinary.js";
import FileUploadModel from "./model.js";
import createHttpError from "http-errors";

const fileRouter = express();
const upload = multer({ dest: 'uploads/' });

// Get all files for an applicant
fileRouter.get('/:applicant_id', async (req, res,next) => {
  try {
    const files = await FileUploadModel.findAll({
      where: {
        applicant_id: req.params.applicant_id,
      },
    });
    res.json(files);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch files' });
    next(error)
  }
});

// Get one file by ID for an applicant
fileRouter.get('/:applicant_id/:file_id', async (req, res,next) => {
  try {
    const file = await FileUploadModel.findOne({
      where: {
        applicant_id: req.params.applicant_id,
        file_id: req.params.file_id,
      },
    });
    if (!file) {
      res.status(404).json({ error: 'File not found' });
      next(
        createHttpError(404,`Fle with id ${req.params.file_id} not found!`)
      )
    } else {
      res.json(file);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch file' });
    next(error)
  }
});

// Upload one file for an applicant
fileRouter.post('/:applicant_id', upload.single('file'), async (req, res,next) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path);
    const file = await FileUploadModel.create({
      applicant_id: req.params.applicant_id,
      filename: req.file.originalname,
      url: result.secure_url,
    });
    res.status(201).json(file);
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload file' });
    next(error)
  }
});

// Upload multiple files for an applicant
fileRouter.post('/:applicant_id/multiple', upload.array('files', 10), async (req, res,next) => {
  try {
    const uploadPromises = req.files.map((file) =>
      cloudinary.uploader.upload(file.path)
    );
    const results = await Promise.all(uploadPromises);
    const files = await FileUploadModel.bulkCreate(
      results.map((result, index) => ({
        applicant_id: req.params.applicant_id,
        filename: req.files[index].originalname,
        url: result.secure_url,
      }))
    );
    res.status(201).json(files);
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload files' });
    next(error)
  }
});

// Delete a file by ID for an applicant
fileRouter.delete('/:applicant_id/:file_id', async (req, res,next) => {
  try {
    const file = await FileUploadModel.findOne({
      where: {
        applicant_id: req.params.applicant_id,
        file_id: req.params.file_id,
      },
    });
    if (!file) {
      res.status(404).json({ error: 'File not found' });
      next(
        createHttpError(404,`Fle with id ${req.params.file_id} not found!`)
      )
    } else {
      await cloudinary.uploader.destroy(file.filename);
      await file.destroy();
      res.status(204).send();
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete file' });
    next(error)
  }
});

export default fileRouter;
