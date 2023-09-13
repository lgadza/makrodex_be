import express from "express";
import multer from "multer";
import cloudinary from "../lib/cloudinary.js";
import FileUploadModel from "./model.js";
import createHttpError from "http-errors";
import UserModel from "../users/model.js";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { JWTAuthMiddleware } from "../lib/auth/jwtAuth.js";


const fileRouter = express.Router();
const upload = multer({ dest: 'uploads/' });

const cloudinaryUploader = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "makronexus/img/users",
    },
  }),
  limits: { fileSize: 1024 * 1024 * 2 },
}).single("avatar");

// Post user Avatar
fileRouter.post("/:user_id/avatar", JWTAuthMiddleware, cloudinaryUploader,async(req,res,next)=>{
  try{
    const user_id=req.params.user_id
    const url=req.file.path
    console.log(url,"URL AVATAR")

     // Find the user by user_id and update the avatar URL
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
      next(
        createHttpError(404, `User with id ${user_id} not found!`)
      );
    }

  }catch(error){
    console.log(error,"Error")
  }
})

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

// Get one file by ID for an user
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

// Upload one file for an user
fileRouter.post('/:user_id', upload.single('file'), async (req, res, next) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path);
    const file = await FileUploadModel.create({
      user_id: req.params.user_id,
      filename: req.file.originalname,
      url: result.secure_url,
    });
    res.status(201).json(file);
  } catch (error) {
    console.log(error,"ERROES")
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
