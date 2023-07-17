import express from "express";
import createHttpError from "http-errors";
import ApplicantModel from "./model.js";
import { Op } from "sequelize";
import ParentModel from "../guardians/model.js";
import { createAccessToken } from "../lib/auth/tools.js";
import { checkApplicantSchema, triggerBadRequest } from "./validator.js";
import {JWTAuthMiddleware} from "../lib/auth/jwtAuth.js"

const applicantRouter = express.Router();

applicantRouter.post("/register", checkApplicantSchema, triggerBadRequest, async (req, res, next) => {
  try {
    const { email } = req.body; // Destructure the email from req.body
    const applicant = await ApplicantModel.findOne({ where: { email } });
    if (applicant) {
       res.send({
        message: "This email has already been registered. Please login.",
      });
    } else {
      const new_applicant = await ApplicantModel.create(req.body);
      const {id } = new_applicant;
      res.status(201).send(id );
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

applicantRouter.get("/", async (req, res, next) => {
  try {
    const query = {};
    if (req.query.first_name) query.first_name = { [Op.iLike]: `${req.query.first_name}%` };
    const applicants = await ApplicantModel.findAll({
      where: { ...query },
      attributes: { exclude: ["password","createdAt"], },
      include: {
        model: ParentModel,
        attributes: ["first_name", "last_name", "gender", "phone_number"],
        through: { attributes: [] },
      },
    });
    res.send(applicants);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
    next(error);
  }
});

applicantRouter.get("/me",JWTAuthMiddleware, async (req, res, next) => {
  try {
    const applicant = await ApplicantModel.findByPk(req.user.id, {
      attributes: { exclude: ["password","createdAt"] },
      include: [ParentModel],
    });
    if (applicant) {
      res.send(applicant);
    } else {
      next(
        createHttpError(404, `Applicant with id ${req.user.id} is not found!`)
      );
    }
  } catch (error) {
    next(error);
  }
});

applicantRouter.put("/me",JWTAuthMiddleware, async (req, res, next) => {
  try {
    const [numberOfUpdatedRows] = await ApplicantModel.update(
      req.body,
      {
        where: { id: req.user.id },
        returning: true,
      }
    );
    if (numberOfUpdatedRows === 1) {
      const updatedRecord = await ApplicantModel.findOne({
        where: { id: req.user.id },
        attributes: { exclude: ["password", "createdAt"] }, 
        raw: true, // Retrieve the record as plain JSON data
      });
      delete updatedRecord.password; // Manually delete the "password" attribute
      delete updatedRecord.createdAt; 
      res.send(updatedRecord);
    } else {
      next(
        createHttpError(404, `Applicant with id ${req.user.id} is not found!`)
      );
    }
  } catch (error) {
    next(error);
  }
});



applicantRouter.delete("/me",JWTAuthMiddleware,async (req, res, next) => {
  try {
    const numberOfDeletedRows = await ApplicantModel.destroy({
      where: { id: req.user.id },
    });
    if (numberOfDeletedRows === 1) {
      res.status(204).send();
    } else {
      next(
        createHttpError(404, `Applicant with id ${req.user.id} is not found!`)
      );
    }
  } catch (error) {
    next(error);
  }
});
applicantRouter.post("/login",async (req,res,next)=>{
 try{
  const {email,password}=req.body;
  const applicant = await ApplicantModel.checkCredentials(email,password)
  if(applicant){
  const payload={id:applicant.id,email:applicant.email,role:applicant.role}
      const accessToken=await createAccessToken(payload)
      res.send({accessToken}) 
  }else{
    next(createHttpError(401, "Credentials are wrong!"))
  }
 }catch(error){
  console.log(error)
  next(error)
 }
})

export default applicantRouter;