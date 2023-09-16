import express from "express"
import AIFileModel from "./model.js";
import UserModel from "../../users/model.js";
import UserAISettingsModel from "../userAISettings/model.js";
const AIFileRouter=express.Router()




// GET All specific user, specific dataset files
AIFileRouter.get("/datasets/:user_id/:dataset_id/files", async (req, res, next) => {
  try {
    const { user_id, dataset_id } = req.params;
    const user = await UserModel.findByPk(user_id);

    if (!user) {
      return next(createHttpError(404, `User with id ${user_id} not found!`));
    }

    const database = await UserAISettingsModel.findOne({
      where: { id: dataset_id, user_id: user.id },
    });

    if (!database) {
      return res.status(404).json({ message: `Database with id ${dataset_id} and user id ${user_id} not found` });
    }

    const databaseFiles = await UserAISettingsModel.findAll({
      include: {
        model: AIFileModel,
        where: {
          userAISettings_id: dataset_id,
        },
        order: [["createdAt", "ASC"]],
      },
    });

    res.json(databaseFiles[0].ai_files);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching files." });
  }
});

AIFileRouter.get("/datasets/:user_id/:dataset_id/files/:file_id", async (req, res) => {
  try {
    const { user_id, dataset_id, file_id } = req.params;
    const user = await UserModel.findByPk(user_id);

    if (!user) {
      return res.status(404).json({ message: `User with id ${user_id} not found` });
    }

    const database = await UserAISettingsModel.findOne({
      where: { id: dataset_id, user_id: user.id },
    });

    if (!database) {
      return res.status(404).json({ message: `Database with id ${dataset_id} and user id ${user_id} not found` });
    }

    const file = await AIFileModel.findByPk(file_id);

    if (!file) {
      return res.status(404).json({ message: "File not found." });
    }

    res.json(file);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching file." });
  }
});




// DELETE a file by ID
AIFileRouter.delete("/datasets/:user_id/:dataset_id/files/:file_id", async (req, res) => {
  try {
    const { user_id, dataset_id, file_id } = req.params;
    const user = await UserModel.findByPk(user_id);

    if (!user) {
      return res.status(404).json({ message: `User with id ${user_id} not found` });
    }

    const database = await UserAISettingsModel.findOne({
      where: { id: dataset_id, user_id: user.id },
    });

    if (!database) {
      return res.status(404).json({ message: `Database with id ${dataset_id} and user id ${user_id} not found` });
    }

    const file = await AIFileModel.findByPk(file_id);

    if (!file) {
      return res.status(404).json({ message: "File not found." });
    }
    await file.destroy();
    res.status(204).send(); 
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error deleting file." });
  }
});


// GET all files associated with a user's settings
AIFileRouter.get("/datasets/:dataset_id/files", async (req, res) => {
  try {
    const { userSettingsId } = req.params;
    const files = await AIFileModel.findAll({
      where: { userSettingsId },
    });

    res.json(files);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching files." });
  }
});

export default AIFileRouter;
