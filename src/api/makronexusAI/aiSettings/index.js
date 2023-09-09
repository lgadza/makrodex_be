import express from "express";
import AiSettings from "./model.js";
import UserModel from "../../users/model.js";
import { JWTAuthMiddleware } from "../../lib/auth/jwtAuth.js";

const aiSettingsRouter = express.Router();



// Create a new aiSettings
aiSettingsRouter.post("/:user_id/aiSettings", JWTAuthMiddleware, async (req, res, next) => {
    try {
      const { user_id } = req.params;
      const user = await UserModel.findByPk(user_id);
  
      if (!user) {
        return res.status(404).json({ error: "User not found!" });
      }
      const { temperature, personality, tittle } = req.body;
  
      const newAiSettings = await AiSettings.create({
        temperature,
        personality,
        tittle,
      });
  
      await user.setAiAiSettings(newAiSettings);
  
      res.json(newAiSettings);
    } catch (error) {
      console.error(error);
      next(error);
    }
  });
  

// Get aiSettings for a specific user
aiSettingsRouter.get("/:user_id/aiSettings", JWTAuthMiddleware, async (req, res, next) => {
    try {
      const { user_id } = req.params;
      const user = await UserModel.findByPk(user_id);
      
      if (!user) {
        return res.status(404).json({ error: "User not found!" });
      }
      
      const aiSettings = await AiSettings.findAll({
        where: {
          aiSettings_id: user_id, // Assuming this is how you associate AI settings with a user
        },
      });
      
      if (aiSettings.length === 0) {
        return res.status(404).json({ error: "No AiSettings available for this user, create a new aiSettings" });
      }
      
      res.json(aiSettings);
    } catch (error) {
      console.error(error);
      next(error);
    }
  });
  // Update aiSettings for a specific user
aiSettingsRouter.put("/:user_id/aiSettings", JWTAuthMiddleware, async (req, res, next) => {
    try {
      const { user_id } = req.params;
      const { temperature, personality, tittle } = req.body;
  
      // Check if the user exists
      const user = await UserModel.findByPk(user_id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
  
      // Find the associated aiSettings for the user
      const aiSettings = await AiSettings.findOne({
        where: { aiSettings_id: user_id },
      });
  
      // If aiSettings doesn't exist, create a new one
      if (!aiSettings) {
        const newAiSettings = await AiSettings.create({
          temperature,
          personality,
          tittle,
          aiSettings_id: user_id,
        });
        return res.status(201).json(newAiSettings);
      }
  
      // Update aiSettings with the provided data
      aiSettings.temperature = temperature;
      aiSettings.personality = personality;
      aiSettings.tittle = tittle;
      await aiSettings.save();
  
      res.json(aiSettings);
    } catch (error) {
      console.error(error);
      next(error);
    }
  });
  
  
// Delete an aiSettings for a specific user
aiSettingsRouter.delete("/:aiSettings_id", JWTAuthMiddleware, async (req, res, next) => {
    try {
      const { aiSettings_id } = req.params;
  
      const aiSettings = await AiSettings.findByPk(aiSettings_id);
      
      if (!aiSettings) {
        return res.status(404).json({ error: "AiSettings not found" });
      }
  
      // Check if the user associated with this aiSettings exists
      const user = await UserModel.findByPk(aiSettings.user_id);
  
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
  
  
      // Delete the aiSettings
      await aiSettings.destroy();
  
      res.json({ message: "AiSettings deleted successfully" });
    } catch (error) {
      console.error(error);
      next(error);
    }
  });
  


export default aiSettingsRouter;
