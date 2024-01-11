import express from 'express';
import { asyncHandler } from '../../../middleware/asyncHandler.js';
import ProblemModel from './problem/model.js';
import SolutionModel from './solutions/model.js';
import OutcomeModel from './outcome/model.js';
import ProjectModel from './model.js';
import validation from './validation.js';
import sequelize from '../../../db.js';
import MediaModel from '../media/model.js';
import UserModel from '../../users/model.js';
import validateProjectUpdate from './validateProjectUpdate.js';
import { validationResult } from 'express-validator';
import CommentModel from '../comments/mode.js';
import LikeModel from '../likes/model.js';


const projectRouter = express.Router();

projectRouter.post('/create-project',validation ,asyncHandler(async (req, res) => {
    const { title, background, start_date, end_date, owner_id, status, visibility, problems, solutions, outcomes,school_id } = req.body;

    try {
        const newProject = await sequelize.transaction(async (transaction) => {
            const project = await ProjectModel.create({
                title, 
                background, 
                start_date, 
                end_date, 
                owner_id, 
                school_id, 
                status, 
                visibility
            }, { transaction });

            if (problems) {
                for (const problem of problems) {
                    await ProblemModel.create({ ...problem, project_id: project.id }, { transaction });
                }
            }

            if (solutions) {
                for (const solution of solutions) {
                    await SolutionModel.create({ ...solution, project_id: project.id }, { transaction });
                }
            }

            if (outcomes) {
                for (const outcome of outcomes) {
                    await OutcomeModel.create({ ...outcome, project_id: project.id }, { transaction });
                }
            }

            return project;
        });

        res.status(201).json({
            message: 'Project created successfully',
            data: newProject
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}));
projectRouter.get('/', asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1; 
    const offset = (page - 1) * limit;

    let whereClause = {};

    // Text search in title or background
    if (req.query.search) {
        whereClause[Op.or] = [
            { title: { [Op.iLike]: `%${req.query.search}%` } },
            { background: { [Op.iLike]: `%${req.query.search}%` } }
        ];
    }

    // Filter by date range
    if (req.query.startDate && req.query.endDate) {
        whereClause.start_date = {
            [Op.gte]: new Date(req.query.startDate),
            [Op.lte]: new Date(req.query.endDate)
        };
    }

    // Filter by project status
    if (req.query.status) {
        whereClause.status = req.query.status;
    }

    // Filter by visibility
    if (req.query.visibility) {
        whereClause.visibility = req.query.visibility;
    }

    // Filter by owner ID
    if (req.query.owner_id) {
        whereClause.owner_id = req.query.owner_id;
    }
    // Filter by School ID
    if (req.query.school_id) {
        whereClause.school_id_id = req.query.school_id;
    }
    const { count: totalProjects, rows: projects } = await ProjectModel.findAndCountAll({
        where: whereClause,
        include: [
            { model: MediaModel, as: 'media' },
            { model: ProblemModel, as: 'problems' },
            { model: SolutionModel, as: 'solutions' },
            { model: OutcomeModel, as: 'outcomes' },
            {
                model: UserModel,
                as: 'owner',
                attributes: ['id', 'first_name', 'last_name', 'avatar',"role"]
            },
            {
                model: LikeModel, 
                as:"likes",
                attributes: ['id','project_id',"user_id"],
            },
        ],
        limit,
        offset,
        order: [['createdAt', 'DESC']], 
    });

    const totalPages = Math.ceil(totalProjects / limit);

    res.status(200).json({
        totalProjects,
        totalPages,
        currentPage: page,
        projectsPerPage: limit,
        projects
    });
}));
projectRouter.get('/:project_id', asyncHandler(async (req, res) => {
    const { project_id } = req.params;

    const project = await ProjectModel.findByPk(project_id, {
        include: [
            { model: MediaModel, as: 'media' },
            { model: ProblemModel, as: 'problems' },
            { model: SolutionModel, as: 'solutions' },
            { model: OutcomeModel, as: 'outcomes' },
            {
                model: CommentModel,
                as: 'comments',
                attributes: ['id', 'comment_text', 'user_id'],
                include: [{
                    model: UserModel,
                    as: 'user',
                    attributes: ['id', 'first_name', 'last_name', 'avatar',"role"] 
                },
                {
                    model: LikeModel, 
                    as:"likes",
                    attributes: ['id','comment_id',"user_id"],
                },
            ]
        },
            {
                model: UserModel,
                as: 'owner',
                attributes: ['id', 'first_name', 'last_name', 'avatar',"role"]
            },
            {
                model: LikeModel, 
                as:"likes",
                attributes: ['id','project_id',"user_id"],
            },
           
        ]
    });

    if (!project) {
        return res.status(404).json({ message: 'Project not found' });
    }

    res.status(200).json(project);
}));
projectRouter.put('/:project_id', validateProjectUpdate, asyncHandler(async (req, res) => {
    const { project_id } = req.params;
    const { problems, solutions, outcomes, ...updateData } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const project = await sequelize.transaction(async (transaction) => {
            const foundProject = await ProjectModel.findByPk(project_id, { transaction });
            if (!foundProject) {
                throw new Error('Project not found');
            }

            await foundProject.update(updateData, { transaction });

            // Handle updates to problems, solutions, and outcomes
            if (problems) {
                // Similar logic would apply to solutions and outcomes
                await Promise.all(problems.map(problem => {
                    if (problem.id) {
                        return ProblemModel.update(problem, { where: { id: problem.id, project_id: project_id }, transaction });
                    } else {
                        return ProblemModel.create({ ...problem, project_id: project_id }, { transaction });
                    }
                }));
            }
            if (solutions) {
                // Similar logic would apply to solutions and outcomes
                await Promise.all(solutions.map(solution => {
                    if (solution.id) {
                        return SolutionModel.update(solution, { where: { id: solution.id, project_id: project_id }, transaction });
                    } else {
                        return SolutionModel.create({ ...solution, project_id: project_id }, { transaction });
                    }
                }));
            }
            if (outcomes) {
                // Similar logic would apply to solutions and outcomes
                await Promise.all(outcomes.map(outcome => {
                    if (outcome.id) {
                        return OutcomeModel.update(outcome, { where: { id: outcome.id, project_id: project_id }, transaction });
                    } else {
                        return OutcomeModel.create({ ...outcome, project_id: project_id }, { transaction });
                    }
                }));
            }
            return foundProject;
        });

        res.status(200).json({
            message: 'Project updated successfully',
            data: project
        });
    } catch (error) {
        console.error(error);
        if (error.message === 'Project not found') {
            res.status(404).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}));

projectRouter.delete('/:project_id', asyncHandler(async (req, res) => {
    const { project_id } = req.params;

    const result = await sequelize.transaction(async (transaction) => {
        
        await Promise.all([
            ProblemModel.destroy({ where: { project_id: project_id }, transaction }),
            SolutionModel.destroy({ where: { project_id: project_id }, transaction }),
            OutcomeModel.destroy({ where: { project_id: project_id }, transaction }),
            MediaModel.destroy({ where: { project_id: project_id }, transaction }),
            CommentModel.destroy({ where: { project_id: project_id }, transaction }),
         
        ]);

        // Delete the project
        const deletedProject = await ProjectModel.destroy({
            where: { id: project_id },
            transaction
        });

        if (!deletedProject) {
            throw new Error('Project not found');
        }

        return deletedProject;
    });

    if (!result) {
        return res.status(404).json({ message: 'Project not found' });
    }

    res.status(200).json({ message: 'Project deleted successfully' });
}));
export default projectRouter;
