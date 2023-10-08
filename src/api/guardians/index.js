import express from "express";
import createHttpError from "http-errors";
import GuardianModel from "./model.js";
import {GuardianUser} from "../intermediate_tables/guardian_user.js"; // 
import UserModel from "../users/model.js";

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
parentsRouter.get("/:user_id", async (req, res, next) => {
  try {
    const user_id = req.params.user_id;
    const user = await UserModel.findByPk(user_id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const parent = await GuardianModel.findOne({ where: { user_id } });
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

// Create a new parent and associate with an user
parentsRouter.post("/:user_id", async (req, res, next) => {
  try {
    const user_id = req.params.user_id;
    const user = await UserModel.findByPk(user_id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const { id } = await GuardianModel.create({...req.body,user_id:user_id});

    res.status(201).send(id);
  } catch (error) {
    res.status(500).json({ error: "Failed to create parent" });
    next(error);
  }
});

// Update a parent by ID
parentsRouter.put("/:user_id/:parent_id", async (req, res, next) => {
  try {
    const parent_id = req.params.parent_id;
    const parent = await GuardianModel.findByPk(parent_id);
    if (!parent) {
      createHttpError(404, `Parent with id ${parent_id} not found!`);
    }
       // Get the user ID from the address record
       const user_id = parent.user_id;
       // Find the user by ID
       const user = await UserModel.findByPk(user_id);
       if (!user) {
         return res.status(404).send({ error: "User not found" });
       }
    // Update the address with the new data
    const [numberOfUpdatedRows] = await GuardianModel.update(req.body, {
      where: { id: parent_id },
      returning: true,
    });
    if(numberOfUpdatedRows===0) {
      return res.status(404).send({ error: "Parent not found" });
    }
    await parent.update(req.body);
    res.json(parent);
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