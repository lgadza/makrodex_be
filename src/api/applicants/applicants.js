import express from "express";
import createHttpError from "http-errors";
import ApplicantModel from "./model.js";
import { Op } from "sequelize";
import ParentModel from "../parents/model.js";

const applicantRouter = express.Router();

applicantRouter.post("/register", async (req, res, next) => {
  try {
    const { email } = req.body; // Destructure the email from req.body
    const applicant = await ApplicantModel.findOne({ where: { email } });
    if (applicant) {
       res.send({
        message: "This email has already been registered. Please login.",
      });
    } else {
      const new_applicant = await ApplicantModel.create(req.body);
      const { applicant_id } = new_applicant;
      res.status(201).send({ applicant_id });
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

applicantRouter.get("/:applicant_id", async (req, res, next) => {
  try {
    const applicant = await ApplicantModel.findByPk(req.params.applicant_id, {
      attributes: { exclude: ["password","createdAt"] },
      include: [ParentModel],
    });
    if (applicant) {
      res.send(applicant);
    } else {
      next(
        createHttpError(404, `Applicant with id ${req.params.applicant_id} is not found!`)
      );
    }
  } catch (error) {
    next(error);
  }
});

applicantRouter.put("/:applicant_id", async (req, res, next) => {
  try {
    const [numberOfUpdatedRows] = await ApplicantModel.update(
      req.body,
      {
        where: { applicant_id: req.params.applicant_id },
        returning: true,
      }
    );
    if (numberOfUpdatedRows === 1) {
      const updatedRecord = await ApplicantModel.findOne({
        where: { applicant_id: req.params.applicant_id },
        attributes: { exclude: ["password", "createdAt"] }, 
        raw: true, // Retrieve the record as plain JSON data
      });
      delete updatedRecord.password; // Manually delete the "password" attribute
      delete updatedRecord.createdAt; 
      res.send(updatedRecord);
    } else {
      next(
        createHttpError(404, `Applicant with id ${req.params.applicant_id} is not found!`)
      );
    }
  } catch (error) {
    next(error);
  }
});



applicantRouter.delete("/:applicant_id", async (req, res, next) => {
  try {
    const numberOfDeletedRows = await ApplicantModel.destroy({
      where: { applicant_id: req.params.applicant_id },
    });
    if (numberOfDeletedRows === 1) {
      res.status(204).send();
    } else {
      next(
        createHttpError(404, `Applicant with id ${req.params.applicant_id} is not found!`)
      );
    }
  } catch (error) {
    next(error);
  }
});


export default applicantRouter;