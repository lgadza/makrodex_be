import express from "express"
import ApplicationModel from "./model.js"
import ApplicationSchoolModel from "../intermediate_tables/application_school.js";
import UserModel from "../users/model.js";
const applicationsRouter = express.Router();
// GET all applications
applicationsRouter.get('/', async (req, res) => {
  try {
    const applications = await ApplicationModel.findAll({
        include: [{ model: UserModel }], // Include the UserModel
      });
    res.status(200).json(applications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET one application by ID
applicationsRouter.get('/:application_id', async (req, res) => {
  const { application_id } = req.params;
  try {
    const application = await ApplicationModel.findByPk(application_id,{
        include: [{ model: UserModel }], // Include the UserModel
      });
    if (!application) {
      res.status(404).json({ error: 'Application not found' });
    } else {
      res.status(200).json(application);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST a new application
applicationsRouter.post('/:user_id', async (req, res) => {
  const { school_id } = req.body;
  const user_id=req.params.user_id
  try {
    const newApplication = await ApplicationModel.create({
      school_id,
      user_id:user_id
     
    });
    await ApplicationSchoolModel.create({
        application_id: newApplication.id,
        school_id,
        // user_id,
      });
    res.status(201).json(newApplication);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PUT an existing application by ID
applicationsRouter.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { application_status, grade_level} = req.body;
  try {
    const application = await ApplicationModel.findByPk(id);
    if (!application) {
      res.status(404).json({ error: 'Application not found' });
    } else {
      await application.update({
        application_status,grade_level
        /* Update other attributes here based on your model */
      });
      res.status(200).json(application);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
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
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


export default applicationsRouter