import express from "express";
import multer from "multer";
import cloudinary from "../lib/cloudinary.js";
import FileUploadModel from "./model.js";
import createHttpError from "http-errors";
import UserModel from "../users/model.js";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { JWTAuthMiddleware } from "../lib/auth/jwtAuth.js";
import { generateSignedUrl, s3 } from "../../s3Service.js";

// import PdfParse from "pdf-parse";


const fileRouter = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'di6cppfze',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer to use Cloudinary as storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'makronexus/img/questions', // Optional: Specify a folder in Cloudinary to store the files
    format: async (req, file) => 'png', // Optional: Set the format of the file (e.g., png, jpg, etc.)
    public_id: (req, file) => `${Date.now()}-${file.originalname}`, // Optional: Set the public_id to prevent overwriting files with the same name
  },
});
// ! This is for the above cloudinary storage
// const upload = multer({ 
//   storage: storage , limits: {
//   fileSize: 1024 * 1024 * 20, // 20 MB limit
// },});
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 1024 * 1024 * 20, // 20 MB limit
  },
});
const uploadFileToS3 = (buffer, name, type) => {
  const params = {
    Body: buffer,
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    ContentType: type,
    Key: name
  };
  return s3.upload(params).promise();
};
// Upload files to Amazon S3
fileRouter.post('/amazon_cloud/:user_id', JWTAuthMiddleware, upload.single('file'), async (req, res, next) => {
  try {
    const user_id = req.params.user_id;
    const file = req.file;
    console.log(file,"FILE UPLOADED")
    // Upload the file to S3
    // Upload one file for an user
    const result = await uploadFileToS3(file.buffer, file.originalname, file.mimetype);

    // Save file reference in the database
    const newFile = await FileUploadModel.create({
      user_id,
      filename: file.originalname,
      url: result.Location // URL of the uploaded file
    });

    res.status(201).json(newFile);
  } catch (error) {
    next(error);
  }
});
// Upload multiple files for an user
fileRouter.post('/amazon_cloud/:user_id/multiple', JWTAuthMiddleware, upload.array('files', 10), async (req, res, next) => {
  try {
    const user_id = req.params.user_id;
    const files = req.files;

    const uploadPromises = files.map((file) =>
      uploadFileToS3(file.buffer, file.originalname, file.mimetype)
    );

    const uploadResults = await Promise.all(uploadPromises);

    const newFiles = await FileUploadModel.bulkCreate(
      uploadResults.map((uploadResult, index) => ({
        user_id,
        filename: files[index].originalname,
        url: uploadResult.Location // URL of the uploaded file
      }))
    );

    res.status(201).json(newFiles);
  } catch (error) {
    next(error);
  }
});
// Post user Avatar
fileRouter.post("/:user_id/avatar", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const user_id = req.params.user_id;

    // Check if req.file is defined
    if (!req.file) {
      return next(createHttpError(400, "Avatar file is required."));
    }

    // Check if the file size exceeds the limit
    if (req.file.size > 1024 * 1024 * 2) {
      // File size exceeds the limit
      return next(createHttpError(400, "Avatar file size exceeds the limit."));
    }

    const url = req.file.path;
    console.log(url, "URL AVATAR");

    const [updatedRowCount, updatedUser] = await UserModel.update(
      { avatar: url },
      {
        where: { id: user_id },
        returning: true,
      }
    );

    if (updatedRowCount > 0) {
      const updatedRecord = await UserModel.findOne({
        where: { id: user_id },
        attributes: { exclude: ["password", "createdAt"] },
        raw: true,
      });
      delete updatedRecord.password;
      delete updatedRecord.createdAt;
      res.send(updatedRecord);
    } else {
      next(createHttpError(404, `User with id ${user_id} not found!`));
    }
  } catch (error) {
    console.log(error, "Error");
    next(error);
  }
});

// Get all files for an user
fileRouter.get('/:user_id', async (req, res, next) => {
  try {
    const files = await FileUploadModel.findAll({
      where: {
        user_id: req.params.user_id,
      },
    });
    res.json(files);
  } catch (error) {
    next(error);
  }
});
fileRouter.get('/', async (req, res, next) => {
  // Generate a signed URL for accessing the file
const signedUrl = await generateSignedUrl('makronexus', 'Melly.pdf', 60 * 5); // URL expires in 5 minutes
console.log(signedUrl,"TJDHQVJAFJHFA")
  try {
    const files = await FileUploadModel.findAll();
    res.json(files);
  } catch (error) {
    next(error);
  }
});

fileRouter.get('/:user_id/:file_id', async (req, res, next) => {
  try {
    const file = await FileUploadModel.findOne({
      where: {
        user_id: req.params.user_id,
        file_id: req.params.file_id,
      },
    });
    if (!file) {
      return next(createHttpError(404, `File with id ${req.params.file_id} not found!`));
    }
    res.json(file);
  } catch (error) {
    next(error);
  }
});

fileRouter.post('/:user_id', upload.single('file'), async (req, res, next) => {
  try {
    const result = req.file; // Use req.file instead of req.body
    const file = await FileUploadModel.create({
      user_id: req.params.user_id,
      filename: result.originalname,
      url: result.path, // Note: In Cloudinary, you may want to use result.url instead
    });
    res.status(201).json(file);
  } catch (error) {
    console.log(error, "ERROR");
    next(error);
  }
});

// Upload multiple files for an user
fileRouter.post('/:user_id/multiple', upload.array('files', 10), async (req, res, next) => {
  try {
    const uploadPromises = req.files.map((file) =>
      cloudinary.uploader.upload(file.path)
    );
    const results = await Promise.all(uploadPromises);
    const files = await FileUploadModel.bulkCreate(
      results.map((result, index) => ({
        user_id: req.params.user_id,
        filename: req.files[index].originalname,
        url: result.secure_url,
      }))
    );
    res.status(201).json(files);
  } catch (error) {
    next(error);
  }
});

// Delete a file by ID for an user
fileRouter.delete('/:user_id/:file_id', async (req, res, next) => {
  try {
    const file = await FileUploadModel.destroy({
      where: {
        user_id: req.params.user_id,
        file_id: req.params.file_id,
      },
    });
    if (!file) {
      return next(createHttpError(404, `File with id ${req.params.file_id} not found!`));
    }
    await cloudinary.uploader.destroy(file.filename);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default fileRouter;
