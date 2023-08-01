import express from "express";
import createHttpError from "http-errors";
import GuardianModel from "./model.js";
import {GuardianApplicant} from "../intermediate_tables/guardian_applicant.js"; // 

const parentsRouter = express.Router();

// Get all parents
parentsRouter.get("/", async (req, res, next) => {
  try {
    const parents = await GuardianModel.findAll();
    res.json(parents);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch parents" });
    next(error);
  }
});

// Get one parent by ID
parentsRouter.get("/:parent_id", async (req, res, next) => {
  try {
    const parent = await GuardianModel.findByPk(req.params.parent_id);
    if (!parent) {
      createHttpError(404, `Parent with id ${req.params.parent_id} not found!`);
    } else {
      res.json(parent);
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch parent" });
    next(error);
  }
});

// Create a new parent and associate with an applicant
parentsRouter.post("/:applicant_id", async (req, res, next) => {
  try {
    const { applicant_id } = req.params;
    const { parent_id } = await GuardianModel.create(req.body);

    // Associate the parent with the applicant in the applicant-parent table
    await GuardianApplicant.create({ applicant_id, parent_id });

    res.status(201).send(parent_id);
  } catch (error) {
    res.status(500).json({ error: "Failed to create parent" });
    next(error);
  }
});

// Update a parent by ID
parentsRouter.put("/:parent_id", async (req, res, next) => {
  try {
    const parent = await GuardianModel.findByPk(req.params.parent_id);
    if (!parent) {
      createHttpError(404, `Parent with id ${re.params.parent_id} not found!`);
    } else {
      await parent.update(req.body);
      res.json(parent);
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to update parent" });
    next(error);
  }
});

// Delete a parent by ID
parentsRouter.delete("/:parent_id", async (req, res, next) => {
  try {
    const parent = await GuardianModel.findByPk(req.params.parent_id);
    if (!parent) {
      createHttpError(404, `Parent with id ${re.params.parent_id} not found!`);
    } else {
      await parent.destroy();
      res.status(204).send();
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to delete parent" });
    next(error);
  }
});

export default parentsRouter;