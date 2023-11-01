import express from "express";
import ApplicationModel from "./model.js";
import ApplicationSchoolModel from "../intermediate_tables/application_school.js";
import UserModel from "../users/model.js";

const applicationsRouter = express.Router();

// Middleware to handle errors
const handleErrors = (res, error) => {
  console.error(error);
  res.status(500).json({ error: 'Internal Server Error' });
};

// GET all applications for a school
applicationsRouter.get('/school/:school_id', async (req, res) => {
  const { school_id } = req.params;
  try {
    const applicationIds = await ApplicationSchoolModel.findAll({
      where: { school_id },
    });

    const applicationIdsArray = applicationIds.map(entry => entry.application_id);

    if (applicationIdsArray.length === 0) {
      res.status(404).json({ error: 'No applications found for this school' });
      return;
    }

    const applications = await ApplicationModel.findAll({
      where: { id: applicationIdsArray },
      include: [{ model: UserModel }],
    });

    res.status(200).json(applications);
  } catch (error) {
    handleErrors(res, error);
  }
});

// GET one application by ID
applicationsRouter.get('/:application_id', async (req, res) => {
  const { application_id } = req.params;
  try {
    const application = await ApplicationModel.findByPk(application_id, {
      include: [{ model: UserModel }],
    });

    if (!application) {
      res.status(404).json({ error: 'Application not found' });
    } else {
      res.status(200).json(application);
    }
  } catch (error) {
    handleErrors(res, error);
  }
});

// POST a new application for a school
applicationsRouter.post('/school/:school_id/:user_id', async (req, res) => {
  const { school_id, user_id } = req.params;
  try {
    const newApplication = await ApplicationModel.create({
      school_id,
      user_id,
      ...req.body,
    });

    await ApplicationSchoolModel.create({
      application_id: newApplication.id,
      school_id,
    });

    newApplication.setUser(user_id);
    res.status(201).json(newApplication);
  } catch (error) {
    handleErrors(res, error);
  }
});

// PUT an existing application by ID
applicationsRouter.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { application_status, grade_level } = req.body;
  try {
    const application = await ApplicationModel.findByPk(id);

    if (!application) {
      res.status(404).json({ error: 'Application not found' });
    } else {
      await application.update({
        application_status,
        grade_level,
        // Update other attributes here based on your model
      });
      res.status(200).json(application);
    }
  } catch (error) {
    handleErrors(res, error);
  }
});

// DELETE an application by ID
applicationsRouter.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const application = await ApplicationModel.findByPk(id);

    if (!application) {
      res.status(404).json({ error: 'Application not found' });
    } else {
      await application.destroy();
      res.status(204).end(); // No content on successful deletion
    }
  } catch (error) {
    handleErrors(res, error);
  }
});

export default applicationsRouter;
