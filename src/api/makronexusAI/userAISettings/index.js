// Import necessary modules and initialize Express userAISettingsRouter

import express from "express"
import UserModel from "../../users/model.js";
import UserAISettingsModel from "./model.js";
import { JWTAuthMiddleware } from "../../lib/auth/jwtAuth.js";

const userAISettingsRouter=express.Router()
// POST: Create a new user setting and associate it with the user
userAISettingsRouter.post("/users/:user_id/settings",JWTAuthMiddleware, async (req, res) => {
  try {
    const { user_id } = req.params;
    const user = await UserModel.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newSetting = await UserAISettingsModel.create({
      ...req.body,
      user_id: user.id,
    });

    return res.status(201).json(newSetting);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// GET by ID: Retrieve a specific user setting
userAISettingsRouter.get("/users/:user_id/settings/:settingId", JWTAuthMiddleware,async (req, res) => {
  try {
    const { user_id, settingId } = req.params;
    const user = await UserModel.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const setting = await UserAISettingsModel.findOne({
      where: { id: settingId, user_id: user.id },
    });

    if (!setting) {
      return res.status(404).json({ message: "Setting not found" });
    }

    return res.json(setting);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// PUT: Update a specific user setting
userAISettingsRouter.put("/users/:user_id/settings/:settingId", JWTAuthMiddleware,async (req, res) => {
  try {
    const { user_id, settingId } = req.params;
    const user = await UserModel.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const setting = await UserAISettingsModel.findOne({
      where: { id: settingId, user_id: user.id },
    });

    if (!setting) {
      return res.status(404).json({ message: "Setting not found" });
    }

    await setting.update(req.body);

    return res.json(setting);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// DELETE: Delete a specific user setting
userAISettingsRouter.delete("/users/:user_id/settings/:settingId", JWTAuthMiddleware,async (req, res) => {
  try {
    const { user_id, settingId } = req.params;
    const user = await UserModel.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const setting = await UserAISettingsModel.findOne({
      where: { id: settingId, user_id: user.id },
    });

    if (!setting) {
      return res.status(404).json({ message: "Setting not found" });
    }

    await setting.destroy();

    return res.status(204).send();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// GET all settings for a user
userAISettingsRouter.get("/users/:user_id/settings", JWTAuthMiddleware,async (req, res) => {
  try {
    const { user_id } = req.params;
    const user = await UserModel.findByPk(user_id, {
      include: UserAISettingsModel,
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(user.user_ai_settings);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default userAISettingsRouter