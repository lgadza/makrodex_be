import express from "express"
import CategoriesModel from "./model.js"

const categoriesRouter = express.Router()

// POST /categories - Create a new category
categoriesRouter.post("/", async (req, res, next) => {
  try {
    const { categoryId } = await CategoriesModel.create(req.body)
    res.status(201).send({ id: categoryId })
  } catch (error) {
    next(error)
  }
})
// GET /categories - Retrieve all categories
categoriesRouter.get("/", async (req, res, next) => {
  try {
    const categories = await CategoriesModel.findAll()
    res.send(categories)
  } catch (error) {
    next(error)
  }
})
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
    res.status(500).send(error.message);
}
})
// PUT /categories/:id - Update a specific category by ID
categoriesRouter.put('/:id', async (req, res) => {
  try {
      const updated = await CategoriesModel.update(req.body, {
          where: { id: req.params.id }
      });
      if (updated) {
          const updatedCategory = await CategoriesModel.findByPk(req.params.id);
          res.status(200).json(updatedCategory);
      } else {
          res.status(404).send('Category not found');
      }
  } catch (error) {
      res.status(400).send(error.message);
  }
});
// DELETE /categories/:id - Delete a specific category by ID
categoriesRouter.delete('/:id', async (req, res) => {
  try {
      const deleted = await CategoriesModel.destroy({
          where: { id: req.params.id }
      });
      if (deleted) {
          res.status(204).send();
      } else {
          res.status(404).send('Category not found');
      }
  } catch (error) {
      res.status(500).send(error.message);
  }
});
categoriesRouter.post("/bulk", async (req, res, next) => {
  try {
    const categories = await CategoriesModel.bulkCreate([
      { name: "Node.js" },
      { name: "Backend" },
      { name: "Databases" },
      { name: "React.js" },
    ])
    res.send(categories.map(c => c.categoryId))
  } catch (error) {
    next(error)
  }
})

export default categoriesRouter
