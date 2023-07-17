import express from "express";
import ParentsModel from "./model.js";
import createHttpError from "http-errors";
import ApplicantModel from "../applicants/model.js";

const parentsRouter = express.Router();

// Get all parents
parentsRouter.get("/", async (req, res,next) => {
  try {
    const parents = await ParentsModel.findAll(
      {
        include: {
          model: ApplicantModel,
          attributes: ["first_name", "last_name", "gender", "phone_number"],
          through: { attributes: [] },
        },
      }
    );
    res.json(parents);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch parents" });
next(error)  
}
});

// Get one parent by ID
parentsRouter.get("/:parent_id", async (req, res,next) => {
  try {
    const parent = await ParentsModel.findByPk(req.params.parent_id);
    if (!parent) {
    //   res.status(404).json({ error: "Parent not found" });
      createHttpError(404, `Parent with id ${req.params.parent_id} not found!`)
    } else {
      res.json(parent);
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch parent" });
next(error)  
}
});

// Create a new parent
parentsRouter.post("/", async (req, res,next) => {
  try {
    const {parent_id} = await ParentsModel.create(req.body);
    res.status(201).send(parent_id);
  } catch (error) {
    res.status(500).json({ error: "Failed to create parent" });
next(error)  
}
});

// Update a parent by ID
parentsRouter.put("/:parent_id", async (req, res,next) => {
  try {
    const parent = await ParentsModel.findByPk(req.params.parent_id);
    if (!parent) {
    //   res.status(404).json({ error: "Parent not found" });
      createHttpError(404, `Parent with id ${re.params.parent_id} not found!`)
    } else {
      await parent.update(req.body);
      res.json(parent);
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to update parent" });
next(error)  
}
});

// Delete a parent by ID
parentsRouter.delete("/:parent_id", async (req, res,next) => {
  try {
    const parent = await ParentsModel.findByPk(req.params.parent_id);
    if (!parent) {
    //   res.status(404).json({ error: "Parent not found" });
      createHttpError(404, `Parent with id ${re.params.parent_id} not found!`)

    } else {
      await parent.destroy();
      res.status(204).send();
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to delete parent" });
next(error)  
}
});

export default parentsRouter;
