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
        const newForm = await FormsModel.create(req.body);
        res.status(201).json(newForm);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// PUT /forms/:id - Update a specific form by ID
formRouter.put('/:id', async (req, res) => {
    try {
        const updated = await FormsModel.update(req.body, {
            where: { FormID: req.params.id }
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

// DELETE /forms/:id - Delete a specific form by ID
formRouter.delete('/:id', async (req, res) => {
    try {
        const deleted = await FormsModel.destroy({
            where: { FormID: req.params.id }
        });
        if (deleted) {
            res.status(204).send();
        } else {
            res.status(404).send('Form not found');
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
});

export default formRouter