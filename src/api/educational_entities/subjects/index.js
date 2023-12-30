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

// POST /subjects - Create a new subject
subjectRouter.post('/', async (req, res) => {
    try {
        const { subject_name, category_ids } = req.body; // category_ids is now an array

        // Validate input
        if (!subject_name || !Array.isArray(category_ids) || category_ids.length === 0) {
            return res.status(400).send('Subject name and category IDs are required.');
        }

        // Check if each category_id exists in CategoriesModel
        for (const categoryId of category_ids) {
            const categoryExists = await CategoriesModel.findByPk(categoryId);
            if (!categoryExists) {
                return res.status(404).send(`Category not found for category_id: ${categoryId}`);
            }
        }

        // Create new subject
        const newSubject = await SubjectsModel.create({ subject_name });

        // Add category associations
        await newSubject.addCategories(category_ids); // Sequelize method to associate categories

        // Fetch the complete subject data including its categories
        const completeSubjectData = await SubjectsModel.findByPk(newSubject.id, {
            include: [{ model: CategoriesModel, as: 'categories' }]
        });

        res.status(201).json(completeSubjectData);
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).send('Subject name already exists.');
        }
        res.status(500).send(error.message);
    }
});



subjectRouter.post("/bulk", async (req, res, next) => {
    try {
        
        const subjectsData = [
            { "subject_name": "Biology", "category_ids": ["5fd9a23a-3bb8-486d-b3f6-855b086cd6b3"] },
            { "subject_name": "Chemistry", "category_ids": ["5fd9a23a-3bb8-486d-b3f6-855b086cd6b3"] },
            { "subject_name": "Physics", "category_ids": ["5fd9a23a-3bb8-486d-b3f6-855b086cd6b3"] },
            { "subject_name": "General Science", "category_ids": ["5fd9a23a-3bb8-486d-b3f6-855b086cd6b3"] },
            { "subject_name": "Earth Science", "category_ids": ["5fd9a23a-3bb8-486d-b3f6-855b086cd6b3"] },
            { "subject_name": "Environmental Science", "category_ids": ["5fd9a23a-3bb8-486d-b3f6-855b086cd6b3"] },
            { "subject_name": "Life Science", "category_ids": ["5fd9a23a-3bb8-486d-b3f6-855b086cd6b3"] },
            { "subject_name": "Physical Science", "category_ids": ["5fd9a23a-3bb8-486d-b3f6-855b086cd6b3"] },
            { "subject_name": "Astronomy", "category_ids": ["5fd9a23a-3bb8-486d-b3f6-855b086cd6b3"] }
            // More subjects can be added as required
        ];
        const commercialsSubjectsData = [
            { "subject_name": "Accounting", "category_ids": ["d8c44f76-3b24-4823-9e28-521b8ec0d529"] },
            { "subject_name": "Business Studies", "category_ids": ["d8c44f76-3b24-4823-9e28-521b8ec0d529"] },
            { "subject_name": "Economics", "category_ids": ["d8c44f76-3b24-4823-9e28-521b8ec0d529"] },
            { "subject_name": "Commerce", "category_ids": ["d8c44f76-3b24-4823-9e28-521b8ec0d529"] },
            { "subject_name": "Finance", "category_ids": ["d8c44f76-3b24-4823-9e28-521b8ec0d529"] },
            { "subject_name": "Marketing", "category_ids": ["d8c44f76-3b24-4823-9e28-521b8ec0d529"] },
            { "subject_name": "Entrepreneurship", "category_ids": ["d8c44f76-3b24-4823-9e28-521b8ec0d529"] },
            { "subject_name": "Business Law", "category_ids": ["d8c44f76-3b24-4823-9e28-521b8ec0d529"] },
            { "subject_name": "Management", "category_ids": ["d8c44f76-3b24-4823-9e28-521b8ec0d529"] },
            { "subject_name": "Information Technology for Business", "category_ids": ["d8c44f76-3b24-4823-9e28-521b8ec0d529"] }
            // Additional subjects can be added as required
        ];
        const artsSubjectsData = [
            { "subject_name": "Art & Design", "category_ids": ["uuid-for-arts-category"] },
            { "subject_name": "Music", "category_ids": ["uuid-for-arts-category"] },
            { "subject_name": "Drama", "category_ids": ["uuid-for-arts-category"] },
            { "subject_name": "Dance", "category_ids": ["uuid-for-arts-category"] },
            { "subject_name": "Photography", "category_ids": ["uuid-for-arts-category"] },
            { "subject_name": "Film Studies", "category_ids": ["uuid-for-arts-category"] },
            { "subject_name": "Graphic Design", "category_ids": ["uuid-for-arts-category"] },
            { "subject_name": "Sculpture", "category_ids": ["uuid-for-arts-category"] },
            { "subject_name": "Ceramics", "category_ids": ["uuid-for-arts-category"] },
            { "subject_name": "Fashion Design", "category_ids": ["uuid-for-arts-category"] },
            { "subject_name": "Theater Technology", "category_ids": ["uuid-for-arts-category"] },
            { "subject_name": "Creative Writing", "category_ids": ["uuid-for-arts-category"] }
            // Additional arts-related subjects can be added as required
        ];
        const practicalsSubjectsData = [
            { "subject_name": "Woodwork", "category_ids": ["uuid-for-practicals-category"] },
            { "subject_name": "Fashion and Fabrics", "category_ids": ["uuid-for-practicals-category"] },
            { "subject_name": "Metalwork", "category_ids": ["uuid-for-practicals-category"] },
            { "subject_name": "Technical Drawing", "category_ids": ["uuid-for-practicals-category"] },
            { "subject_name": "Agriculture", "category_ids": ["uuid-for-practicals-category"] },
            { "subject_name": "Home Economics", "category_ids": ["uuid-for-practicals-category"] },
            { "subject_name": "Textile Design", "category_ids": ["uuid-for-practicals-category"] },
            { "subject_name": "Food Technology", "category_ids": ["uuid-for-practicals-category"] },
            { "subject_name": "Electronics", "category_ids": ["uuid-for-practicals-category"] },
            { "subject_name": "Automotive Mechanics", "category_ids": ["uuid-for-practicals-category"] },
            { "subject_name": "Carpentry", "category_ids": ["uuid-for-practicals-category"] },
            { "subject_name": "Plumbing", "category_ids": ["uuid-for-practicals-category"] },
            { "subject_name": "Construction", "category_ids": ["uuid-for-practicals-category"] }
            // Additional practical subjects can be added as needed
        ];
        const technologySubjectsData = [
            { "subject_name": "Computer Science", "category_ids": ["uuid-for-technology-category"] },
            { "subject_name": "Information Technology", "category_ids": ["uuid-for-technology-category"] },
            { "subject_name": "Programming", "category_ids": ["uuid-for-technology-category"] },
            { "subject_name": "Web Development", "category_ids": ["uuid-for-technology-category"] },
            { "subject_name": "Digital Literacy", "category_ids": ["uuid-for-technology-category"] },
            { "subject_name": "Multimedia Studies", "category_ids": ["uuid-for-technology-category"] },
            { "subject_name": "Graphic Design", "category_ids": ["uuid-for-technology-category"] },
            { "subject_name": "Robotics", "category_ids": ["uuid-for-technology-category"] },
            { "subject_name": "Network and Systems Administration", "category_ids": ["uuid-for-technology-category"] },
            { "subject_name": "Cybersecurity", "category_ids": ["uuid-for-technology-category"] },
            { "subject_name": "Data Science", "category_ids": ["uuid-for-technology-category"] },
            { "subject_name": "Artificial Intelligence", "category_ids": ["uuid-for-technology-category"] },
            { "subject_name": "Game Development", "category_ids": ["uuid-for-technology-category"] },
            { "subject_name": "Software Engineering", "category_ids": ["uuid-for-technology-category"] },
            { "subject_name": "Cloud Computing", "category_ids": ["uuid-for-technology-category"] }
            // Additional technology-related subjects can be added as required
        ];
        
                
        // Create subjects without categories
        const createdSubjects = await SubjectsModel.bulkCreate(
            subjectsData.map(subject => ({ subject_name: subject.subject_name })),
            { validate: true }
        );

        // Associate each subject with its category
        for (let i = 0; i < createdSubjects.length; i++) {
            const subject = createdSubjects[i];
            const categoryIds = subjectsData[i].category_ids; // Assuming category_ids is an array of UUIDs

            if (categoryIds && Array.isArray(categoryIds)) {
                for (const categoryId of categoryIds) {
                    // Check if each category_id exists in CategoriesModel
                    const categoryExists = await CategoriesModel.findByPk(categoryId);
                    if (!categoryExists) {
                        return res.status(404).send(`Category not found for category_id: ${categoryId}`);
                    }

                    // Associate subject with category
                    await subject.addCategory(categoryId);
                }
            }
        }

        res.status(201).json(createdSubjects.map(subject => subject.id));
    } catch (error) {
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).send('Validation error occurred.');
        }
        next(error);
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