import express from "express";
import createHttpError from "http-errors";
import { Op } from "sequelize";
import ApplicantModel from "./model.js";
import ParentsModel from "../../parents/model.js";
import ApplicationModel from "../applications/model.js";

const usersRouter = express.Router();

usersRouter.post("/", async (req, res, next) => {
  try {
    const { id } = await ApplicantModel.create(req.body);
    res.status(201).send({ id });
  } catch (error) {
    next(error);
  }
});

usersRouter.get("/", async (req, res, next) => {
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

usersRouter.get("/:userId", async (req, res, next) => {
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

usersRouter.put("/:userId", async (req, res, next) => {
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

usersRouter.delete("/:userId", async (req, res, next) => {
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

export default usersRouter;
