import express from 'express';
import SubjectsModel from './model.js';
import CategoriesModel from '../categories/model.js';


const subjectRouter = express.Router()



// GET /subjects - Retrieve all subjects with categories
subjectRouter.get('/', async (req, res) => {
    try {
        const subjects = await SubjectsModel.findAll({
            include: [{ model: CategoriesModel, as: 'category' }]
        });
        res.json(subjects);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// GET /subjects/:id - Retrieve a specific subject by ID with category
subjectRouter.get('/:id', async (req, res) => {
    try {
        const subject = await SubjectsModel.findByPk(req.params.id, {
            include: [{ model: CategoriesModel, as: 'category' }]
        });
        if (subject) {
            res.json(subject);
        } else {
            res.status(404).send('Subject not found');
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// POST /subjects - Create a new subject with category
subjectRouter.post('/', async (req, res) => {
    try {
        const newSubject = await SubjectsModel.create(req.body);
        res.status(201).json(newSubject);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// PUT /subjects/:id - Update a specific subject by ID with category
subjectRouter.put('/:id', async (req, res) => {
    try {
        const updated = await SubjectsModel.update(req.body, {
            where: { id: req.params.id }
        });
        if (updated) {
            const updatedSubject = await SubjectsModel.findByPk(req.params.id, {
                include: [{ model: CategoriesModel, as: 'category' }]
            });
            res.status(200).json(updatedSubject);
        } else {
            res.status(404).send('Subject not found');
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// DELETE /subjects/:id - Delete a specific subject by ID
subjectRouter.delete('/:id', async (req, res) => {
    try {
        const deleted = await SubjectsModel.destroy({
            where: { id: req.params.id }
        });
        if (deleted) {
            res.status(204).send();
        } else {
            res.status(404).send('Subject not found');
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
});

export default subjectRouter