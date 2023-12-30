import express from "express";
import CategoriesModel from "./model.js";

const categoriesRouter = express.Router();

// Error handling middleware
function errorHandler(err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
}

// POST /categories - Create a new category
categoriesRouter.post("/", async (req, res, next) => {
  try {
    const { id } = await CategoriesModel.create(req.body);
    res.status(201).json({ id });
  } catch (error) {
    next(error);
  }
});

// GET /categories - Retrieve all categories
categoriesRouter.get("/", async (req, res, next) => {
  try {
    const categories = await CategoriesModel.findAll();
    res.json(categories);
  } catch (error) {
    next(error);
  }
});

// GET /categories/:id - Retrieve a specific category by ID
categoriesRouter.get("/:id", async (req, res, next) => {
  try {
    const category = await CategoriesModel.findByPk(req.params.id);
    if (category) {
      res.json(category);
    } else {
      res.status(404).send('Category not found');
    }
  } catch (error) {
    next(error);
  }
});

// PUT /categories/:id - Update a specific category by ID
categoriesRouter.put('/:id', async (req, res, next) => {
  try {
    const [updatedCount] = await CategoriesModel.update(req.body, {
      where: { id: req.params.id }
    });
    if (updatedCount > 0) {
      const updatedCategory = await CategoriesModel.findByPk(req.params.id);
      res.json(updatedCategory);
    } else {
      res.status(404).send('Category not found');
    }
  } catch (error) {
    next(error);
  }
});

// DELETE /categories/:id - Delete a specific category by ID
categoriesRouter.delete('/:id', async (req, res, next) => {
  try {
    const deletedCount = await CategoriesModel.destroy({
      where: { id: req.params.id }
    });
    if (deletedCount > 0) {
      res.status(204).send();
    } else {
      res.status(404).send('Category not found');
    }
  } catch (error) {
    next(error);
  }
});

// POST /categories/bulk - Create multiple categories
categoriesRouter.post("/bulk", async (req, res, next) => {
  try {
    const categories = await CategoriesModel.bulkCreate([
      { category_name: "Sciences" },
      { category_name: "Commercials" },
      { category_name: "Languages" },
      { category_name: "Practicals" },
      { category_name: "Arts" },
      { category_name: "Technology" },
      { category_name: "Languages" },
    ]);
    res.status(201).json(categories.map(c => c.id));
  } catch (error) {
    next(error);
  }
});

// Use the error handling middleware
categoriesRouter.use(errorHandler);

export default categoriesRouter;
