import express from "express";
import UserFeatureUsageModel from "./model.js";
import UserModel from "../../users/model.js";
import { Op } from "sequelize";
import dotenv from "dotenv"; // Import dotenv for environment variables

dotenv.config(); // Initialize dotenv

const usageRouter = express.Router();

// Environment variables for limits
const CONVERSATION_LIMIT = process.env.CONVERSATION_LIMIT || 50;
const IMAGE_GENERATION_LIMIT = process.env.IMAGE_GENERATION_LIMIT || 2;
const IMAGE_INTERPRETATION_LIMIT = process.env.IMAGE_INTERPRETATION_LIMIT || 5;
const TEXT_TO_VOICE_LIMIT = process.env.TEXT_TO_VOICE_LIMIT || 5;

// Reusable function to handle feature usage
export async function handleFeatureUsage(user_id, feature_type, limit) {
  if (!user_id) {
    throw new Error("Invalid user ID.");
  }

  const user = await UserModel.findByPk(user_id);
  if (!user) {
    throw new Error("User not found.");
  }

  const currentDate = new Date();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

  let [usageRecord, created] = await UserFeatureUsageModel.findOrCreate({
    where: {
      user_id: user_id,
      feature_type: feature_type,
      last_used_at: {
        [Op.gte]: firstDayOfMonth
      }
    },
    defaults: { user_id, feature_type, current_month_usage_count: 0, total_usage_count: 0 }
  });

  if (!created && usageRecord.last_used_at < firstDayOfMonth) {
    usageRecord.current_month_usage_count = 0;
    usageRecord.last_used_at = currentDate;
  }

  await usageRecord.increment('current_month_usage_count', { by: 1 });
  await usageRecord.increment('total_usage_count', { by: 1 });
  await usageRecord.update({ last_used_at: currentDate });

  return {
    limitReached: usageRecord.current_month_usage_count >= limit,
    currentUsageCount: usageRecord.current_month_usage_count
  };
}

// Define routes using the reusable function
usageRouter.post('/conversation', async (req, res) => {
  const { user_id } = req.body;

  try {
    const usage = await handleFeatureUsage(user_id, 'conversation', CONVERSATION_LIMIT);
    if (usage.limitReached) {
      return res.status(403).send({ message: 'Conversation limit reached. Please upgrade to premium.' });
    }
    res.status(200).send({ message: 'Conversation processed successfully.', usageCount: usage.currentUsageCount });
  } catch (error) {
    console.error("Error in conversation endpoint: ", error.message);
    res.status(500).send("An error occurred. Please try again later.");
  }
});

// ... other routes ...

export default usageRouter;
