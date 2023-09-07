import express from "express";
import multer from "multer";
import cloudinary from "../lib/cloudinary.js";
import FileUploadModel from "./model.js";
import createHttpError from "http-errors";
import ApplicantModel from "../applicants/model.js";
// import { CloudinaryStorage } from "multer-storage-cloudinary";


const fileRouter = express.Router();
const upload = multer({ dest: 'uploads/' });

// const cloudinaryUploader = multer({
//   storage: new CloudinaryStorage({
//     cloudinary,
//     params: {
//       folder: "makronexus/img/users",
//     },
//   }),
//   limits: { fileSize: 1024 * 1024 * 2 },
// }).single("avatar");

// // Post user Avatar
// fileRouter.post("/:user_id/avatar",async(req,res,next)=>{
//   try{
//     const url=req.file.path
//     console.log(url,"URL AVATAR")

//     const uploadUser=await ApplicantModel.findOne({
//       where:{id:req.params.user_id}
//     })

//   }catch(error){
//     console.log(error,"Error")
//   }
// })

// Get all files for an applicant
fileRouter.get('/:applicant_id', async (req, res, next) => {
  try {
    const files = await FileUploadModel.findAll({
      where: {
        applicant_id: req.params.applicant_id,
      },
    });
    res.json(files);
  } catch (error) {
    next(error);
  }
});

// Get one file by ID for an applicant
fileRouter.get('/:applicant_id/:file_id', async (req, res, next) => {
  try {
    const file = await FileUploadModel.findOne({
      where: {
        applicant_id: req.params.applicant_id,
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

// Upload one file for an applicant
fileRouter.post('/:applicant_id', upload.single('file'), async (req, res, next) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path);
    const file = await FileUploadModel.create({
      applicant_id: req.params.applicant_id,
      filename: req.file.originalname,
      url: result.secure_url,
    });
    res.status(201).json(file);
  } catch (error) {
    console.log(error,"ERROES")
    next(error);
  }
});

// Upload multiple files for an applicant
fileRouter.post('/:applicant_id/multiple', upload.array('files', 10), async (req, res, next) => {
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
    next(error);
  }
});

// Delete a file by ID for an applicant
fileRouter.delete('/:applicant_id/:file_id', async (req, res, next) => {
  try {
    const file = await FileUploadModel.destroy({
      where: {
        applicant_id: req.params.applicant_id,
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
