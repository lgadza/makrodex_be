import express from "express";
import createHttpError from "http-errors";
import ApplicantModel from "./model.js";
import { Op } from "sequelize";
import ParentModel from "../parents/model.js";

const applicantRouter = express.Router();

applicantRouter.post("/register", async (req, res, next) => {
  try {
    const { email } = req.body; // Destructure the email from req.body
    const candidate = await ApplicantModel.findOne({ where: { email } });
    if (candidate) {
       res.send({
        message: "This email has already been registered. Please login.",
      });
    } else {
      const new_candidate = await ApplicantModel.create(req.body);
      const { candidate_id } = new_candidate;
      res.status(201).send({ candidate_id });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

applicantRouter.get("/", async (req, res, next) => {
  try {
    const query = {};
    if (req.query.candidate) query.candidate = { [Op.iLike]: `${req.query.candidate}%` };
    const candidates = await ApplicantModel.findAll({
      where: { ...query },
      attributes: { exclude: ["password"] },
      include: {
        model: ParentModel,
        attributes: ["first_name", "last_name", "gender", "phone_number"],
        through: { attributes: [] },
      },
    });
    res.send(candidates);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
    next(error);
  }
});

applicantRouter.post("/", async (req, res, next) => {
  try {
    const { id } = await ApplicantModel.create(req.body);
    res.status(201).send({ id });
  } catch (error) {
    next(error);
  }
});

applicantRouter.get("/", async (req, res, next) => {
  try {
    const query = {};
    if (req.query.user) query.user = { [Op.iLike]: `${req.query.user}%` };
    const users = await ApplicantModel.findAll({
      where: { ...query },
      include: [ParentsModel, ApplicationModel],
    });
    res.send(users);
  } catch (error) {
    next(error);
  }
});

applicantRouter.get("/:userId", async (req, res, next) => {
  try {
    const user = await ApplicantModel.findByPk(req.params.userId, {
      attributes: { exclude: ["createdAt", "updatedAt"] },
      include: [ParentsModel, ApplicationModel],
    });
    if (user) {
      res.send(user);
    } else {
      next(
        createHttpError(404, `User with id ${req.params.userId} is not found!`)
      );
    }
  } catch (error) {
    next(error);
  }
});

applicantRouter.put("/:userId", async (req, res, next) => {
  try {
    const [numberOfUpdatedRows, updatedRecords] = await ApplicantModel.update(
      req.body,
      {
        where: { applicant_id: req.params.userId },
        returning: true,
      }
    );
    if (numberOfUpdatedRows === 1) {
      res.send(updatedRecords[0]);
    } else {
      next(
        createHttpError(404, `User with id ${req.params.userId} is not found!`)
      );
    }
  } catch (error) {
    next(error);
  }
});

applicantRouter.delete("/:userId", async (req, res, next) => {
  try {
    const numberOfDeletedRows = await ApplicantModel.destroy({
      where: { applicant_id: req.params.userId },
    });
    if (numberOfDeletedRows === 1) {
      res.status(204).send();
    } else {
      next(
        createHttpError(404, `User with id ${req.params.userId} is not found!`)
      );
    }
  } catch (error) {
    next(error);
  }
});

export default applicantRouter;