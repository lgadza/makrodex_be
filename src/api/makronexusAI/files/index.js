import express from "express"
const upload = multer({ dest: "uploads/" }); // specify your upload directory

const UserSettingsModel = require("../models/UserSettingsModel");
const FileModel = require("../models/FileModel");

// POST a new file associated with a user's settings
router.post("/:userSettingsId/files", upload.single("file"), async (req, res) => {
  try {
    const { userSettingsId } = req.params;
    const { originalname, mimetype, size } = req.file;

    // Create a new file record in the database
    const file = await FileModel.create({
      type: mimetype,
      name: originalname,
      size,
      userSettingsId,
    });

    res.status(201).json(file);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error creating file." });
  }
});

// GET a single file by ID
router.get("/:fileId", async (req, res) => {
  try {
    const { fileId } = req.params;
    const file = await FileModel.findByPk(fileId);

    if (!file) {
      return res.status(404).json({ error: "File not found." });
    }

    res.json(file);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching file." });
  }
});

// PUT (update) a file by ID
router.put("/:fileId", async (req, res) => {
  try {
    const { fileId } = req.params;
    const { type, name, size } = req.body; // Assuming you send these fields in the request body

    const file = await FileModel.findByPk(fileId);

    if (!file) {
      return res.status(404).json({ error: "File not found." });
    }

    file.type = type;
    file.name = name;
    file.size = size;

    await file.save();

    res.json(file);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error updating file." });
  }
});

// DELETE a file by ID
router.delete("/:fileId", async (req, res) => {
  try {
    const { fileId } = req.params;
    const file = await FileModel.findByPk(fileId);

    if (!file) {
      return res.status(404).json({ error: "File not found." });
    }

    await file.destroy();

    res.status(204).send(); // No content response for successful deletion
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error deleting file." });
  }
});

// GET all files associated with a user's settings
router.get("/:userSettingsId/files", async (req, res) => {
  try {
    const { userSettingsId } = req.params;
    const files = await FileModel.findAll({
      where: { userSettingsId },
    });

    res.json(files);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching files." });
  }
});

module.exports = router;
