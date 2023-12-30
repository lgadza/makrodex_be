import express from 'express';
import SchoolLevelsModel from './model.js';

const schoolLevelRouter = express.Router();



// GET /school_levels - Retrieve all school levels
schoolLevelRouter.get('/', async (req, res) => {
    try {
        const schoolLevels = await SchoolLevelsModel.findAll();
        res.json(schoolLevels);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// GET /school_levels/:id - Retrieve a specific school level by ID
schoolLevelRouter.get('/:id', async (req, res) => {
    try {
        const schoolLevel = await SchoolLevelsModel.findByPk(req.params.id);
        if (schoolLevel) {
            res.json(schoolLevel);
        } else {
            res.status(404).send('School level not found');
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// POST /school_levels - Create a new school level
schoolLevelRouter.post('/', async (req, res) => {
    try {
        const newSchoolLevel = await SchoolLevelsModel.create(req.body);
        res.status(201).json(newSchoolLevel);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// PUT /school_levels/:id - Update a specific school level by ID
schoolLevelRouter.put('/:id', async (req, res) => {
    try {
        const updated = await SchoolLevelsModel.update(req.body, {
            where: { id: req.params.id }
        });
        if (updated) {
            const updatedSchoolLevel = await SchoolLevelsModel.findByPk(req.params.id);
            res.status(200).json(updatedSchoolLevel);
        } else {
            res.status(404).send('School level not found');
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// DELETE /school_levels/:id - Delete a specific school level by ID
schoolLevelRouter.delete('/:id', async (req, res) => {
    try {
        const deleted = await SchoolLevelsModel.destroy({
            where: { id: req.params.id }
        });
        if (deleted) {
            res.status(204).send();
        } else {
            res.status(404).send('School level not found');
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
});

export default schoolLevelRouter