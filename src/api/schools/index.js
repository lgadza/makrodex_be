import express from "express";
import { JWTAuthMiddleware } from "../lib/auth/jwtAuth.js";
import { check, validationResult } from 'express-validator';
import SchoolModel from "./model.js";

const schoolRouter = express.Router();

// Validator middleware for POST requests
const validatePostData = [
  check('name').notEmpty().withMessage('Name is required'),
  check('email').isEmail().withMessage('Invalid email address'),
  check('phone_number').notEmpty().withMessage('Phone number is required'),
  check('school_type').isIn(['private', 'public']).withMessage('Invalid school type'),
  check('boarding_school').isIn(['boarding', 'day']).withMessage('Invalid boarding type'),
  check('principal').notEmpty().withMessage('Principal name is required'),
  check('description').notEmpty().withMessage('Description is required'),
];

// Validator middleware for PUT requests (no validation)
const validatePutData = [];

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  console.log(errors, "ERRORS")
  if (!errors.isEmpty()) {
    const errorList = errors.array().map((error) => error.msg);
    return res.status(400).json({ errors: errorList });
  }
  next();
};

// GET all schools
schoolRouter.get('/', async (req, res) => {
  try {
    const schools = await SchoolModel.findAll();
    res.json(schools);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET one school by ID
schoolRouter.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const school = await SchoolModel.findByPk(id);
    if (school) {
      res.json(school);
    } else {
      res.status(404).json({ error: 'School not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST a new school with validation
schoolRouter.post('/', JWTAuthMiddleware, validatePostData, handleValidationErrors, async (req, res) => {
  const schoolData = req.body;
  try {
    const newSchool = await SchoolModel.create(schoolData);
    res.status(201).json(newSchool);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT (update) a school by ID without validation
schoolRouter.put('/:id', JWTAuthMiddleware, validatePutData, async (req, res) => {
  const { id } = req.params;
  const schoolData = req.body;
  try {
    const school = await SchoolModel.findByPk(id);
    if (school) {
      await school.update(schoolData);
      res.json(school);
    } else {
      res.status(404).json({ error: 'School not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE a school by ID
schoolRouter.delete('/:id', JWTAuthMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const school = await SchoolModel.findByPk(id);
    if (school) {
      await school.destroy();
      res.json({ message: 'School deleted successfully' });
    } else {
      res.status(404).json({ error: 'School not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default schoolRouter;
