import express from 'express';
import SubjectLevelsModel from './model.js';
import FormsModel from '../forms/model.js';
import SubjectsModel from '../subjects/model.js';

const subjectLevelRouter = express.Router()


// GET /subject_levels - Retrieve all subject levels
subjectLevelRouter.get('/', async (req, res) => {
    try {
        const subjectLevels = await SubjectLevelsModel.findAll({
            include: [
                { model: FormsModel, as: 'form' },
                { model: SubjectsModel, as: 'subject' }
            ]
        });
        res.json(subjectLevels);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// GET /subject_levels/:id - Retrieve a specific subject level by ID
subjectLevelRouter.get('/:id', async (req, res) => {
    try {
        const subjectLevel = await SubjectLevelsModel.findByPk(req.params.id, {
            include: [
                { model: FormsModel, as: 'form' },
                { model: SubjectsModel, as: 'subject' }
            ]
        });
        if (subjectLevel) {
            res.json(subjectLevel);
        } else {
            res.status(404).send('Subject level not found');
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// POST /subject_levels - Create a new subject level
subjectLevelRouter.post('/', async (req, res) => {
    try {
        const newSubjectLevel = await SubjectLevelsModel.create(req.body);
        res.status(201).json(newSubjectLevel);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// PUT /subject_levels/:id - Update a specific subject level by ID
subjectLevelRouter.put('/:id', async (req, res) => {
    try {
        const updated = await SubjectLevelsModel.update(req.body, {
            where: { id: req.params.id }
        });
        if (updated) {
            const updatedSubjectLevel = await SubjectLevelsModel.findByPk(req.params.id, {
                include: [
                    { model: FormsModel, as: 'form' },
                    { model: SubjectsModel, as: 'subject' }
                ]
            });
            res.status(200).json(updatedSubjectLevel);
        } else {
            res.status(404).send('Subject level not found');
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// DELETE /subject_levels/:id - Delete a specific subject level by ID
subjectLevelRouter.delete('/:id', async (req, res) => {
    try {
        const deleted = await SubjectLevelsModel.destroy({
            where: { id: req.params.id }
        });
        if (deleted) {
            res.status(204).send();
        } else {
            res.status(404).send('Subject level not found');
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
});

export default subjectLevelRouter