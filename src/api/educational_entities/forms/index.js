import express from 'express';
import FormsModel from './model.js';
import SchoolLevelsModel from '../school_levels/model.js';


const formRouter = express.Router()


// GET /forms - Retrieve all forms
formRouter.get('/', async (req, res) => {
    try {
        const forms = await FormsModel.findAll({
            include: [{ model: SchoolLevelsModel, as: 'level' }]
        });
        res.json(forms);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// GET /forms/:id - Retrieve a specific form by ID
formRouter.get('/:id', async (req, res) => {
    try {
        const form = await FormsModel.findByPk(req.params.id, {
            include: [{ model: SchoolLevelsModel, as: 'level' }]
        });
        if (form) {
            res.json(form);
        } else {
            res.status(404).send('Form not found');
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// POST /forms - Create a new form
formRouter.post('/', async (req, res) => {
    try {
        const { level_id, form_name } = req.body;

        // Validate input
        if (!level_id || !form_name) {
            return res.status(400).send('Missing level_id or form_name');
        }

        // Check if level_id exists in SchoolLevelsModel
        const levelExists = await SchoolLevelsModel.findByPk(level_id);
        if (!levelExists) {
            return res.status(404).send('School level not found');
        }

        // Create new form
        const newForm = await FormsModel.create({ level_id, form_name });
        res.status(201).json(newForm);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// PUT /forms/:id - Update a specific form by ID
formRouter.put('/:id', async (req, res) => {
    try {
        const updated = await FormsModel.update(req.body, {
            where: { id: req.params.id }
        });
        if (updated) {
            const updatedForm = await FormsModel.findByPk(req.params.id, {
                include: [{ model: SchoolLevelsModel, as: 'level' }]
            });
            res.status(200).json(updatedForm);
        } else {
            res.status(404).send('Form not found');
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
});

formRouter.post("/bulk", async (req, res, next) => {
    try {
        const secondaryFormData = [
            {
                "form_name": "Form 1",
                "level_id": "d8d6d0fc-62aa-4e6d-9ad0-d5f1581e23ba"
            },
            {
                "form_name": "Form 2",
                "level_id": "d8d6d0fc-62aa-4e6d-9ad0-d5f1581e23ba"
            },
            {
                "form_name": "Form 3",
                "level_id": "d8d6d0fc-62aa-4e6d-9ad0-d5f1581e23ba"
            },
            {
                "form_name": "Form 4",
                "level_id": "d8d6d0fc-62aa-4e6d-9ad0-d5f1581e23ba"
            },
            {
                "form_name": "Form 5",
                "level_id": "d8d6d0fc-62aa-4e6d-9ad0-d5f1581e23ba"
            },
            {
                "form_name": "Form 6",
                "level_id": "d8d6d0fc-62aa-4e6d-9ad0-d5f1581e23ba"
            }
        ]
        ;
        const primaryFormData=[
            {
                "form_name": "Grade 1",
                "level_id": "fbd31d8d-c7c8-43bb-b571-a21c2dfd6b8d"
            },
            {
                "form_name": "Grade 2",
                "level_id": "fbd31d8d-c7c8-43bb-b571-a21c2dfd6b8d"
            },
            {
                "form_name": "Grade 3",
                "level_id": "fbd31d8d-c7c8-43bb-b571-a21c2dfd6b8d"
            },
            {
                "form_name": "Grade 4",
                "level_id": "fbd31d8d-c7c8-43bb-b571-a21c2dfd6b8d"
            },
            {
                "form_name": "Grade 5",
                "level_id": "fbd31d8d-c7c8-43bb-b571-a21c2dfd6b8d"
            },
            {
                "form_name": "Grade 6",
                "level_id": "fbd31d8d-c7c8-43bb-b571-a21c2dfd6b8d"
            },
            {
                "form_name": "Grade 7",
                "level_id": "fbd31d8d-c7c8-43bb-b571-a21c2dfd6b8d"
            }
        ]
        
        // Validate secondaryFormData to ensure each item has a form_name and a valid level_id
        for (const form of primaryFormData) {
            if (!form.form_name || !form.level_id) {
                return res.status(400).send('Each form must have a form_name and a level_id');
            }

            // Check if level_id exists in SchoolLevelsModel
            const levelExists = await SchoolLevelsModel.findByPk(form.level_id);
            if (!levelExists) {
                return res.status(404).send(`School level not found for level_id: ${form.level_id}`);
            }
        }

        // Bulk create forms after validation
        const forms = await FormsModel.bulkCreate(primaryFormData, {
            validate: true, // Sequelize option to validate each entry before bulk creating
        });
        res.status(201).send(forms.map(form => ({
            id: form.id, 
            form_name: form.form_name, 
            level_id: form.level_id
        })));
    } catch (error) {
        next(error);  
    }
});


// DELETE /forms/:id - Delete a specific form by ID
formRouter.delete('/:id', async (req, res) => {
    try {
        const deleted = await FormsModel.destroy({
            where: { FormID: req.params.id }
        });
        if (deleted) {
            res.status(204).send("Deleted");
        } else {
            res.status(404).send('Form not found');
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
});

export default formRouter