import express from "express"
import BlogsModel from "./model.js"
import UsersModel from "../users/model.js"
import BlogsCategoriesModel from "./blogsCategoriesModel.js"
import CategoriesModel from "../categories/model.js"

const blogsRouter = express.Router()

blogsRouter.post("/", async (req, res, next) => {
  try {
    const { blogId } = await BlogsModel.create(req.body)

    if (req.body.categories) {
      await BlogsCategoriesModel.bulkCreate(
        req.body.categories.map(category => {
          return {
            categoryId: category,
            blogId,
          }
        })
      ) // --> [{categoryId: "asdasd", blogId: "asdasdasdas"}]
    }
    res.status(201).send({ id: blogId })
  } catch (error) {
    next(error)
  }
})

blogsRouter.get("/", async (req, res, next) => {
  try {
    const blogs = await BlogsModel.findAll({
      include: [
        { model: UsersModel, attributes: ["firstName", "lastName"] },
        { model: CategoriesModel, attributes: ["name"], through: { attributes: [] } },
        // to exclude from the result the junction table rows --> through: { attributes: [] }
      ],
    })
    res.send(blogs)
  } catch (error) {
    next(error)
  }
})

blogsRouter.put("/:blogId/category", async (req, res, next) => {
  try {
    const { id } = await BlogsCategoriesModel.create({
      blogId: req.params.blogId,
      categoryId: req.body.categoryId,
    })
    res.status(201).send({ id })
  } catch (error) {
    next(error)
  }
})

export default blogsRouter
