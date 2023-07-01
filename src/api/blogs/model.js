import { DataTypes } from "sequelize"
import sequelize from "../../db.js"
import CategoriesModel from "../categories/model.js"
import UsersModel from "../users/model.js"
import BlogsCategoriesModel from "./blogsCategoriesModel.js"

const BlogsModel = sequelize.define("blog", {
  blogId: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  content: {
    type: DataTypes.STRING,
    allowNull: false,
  },
})

// 1 to many relationship
UsersModel.hasMany(BlogsModel, { foreignKey: { allowNull: false } })
BlogsModel.belongsTo(UsersModel)

// Many to many relationship
BlogsModel.belongsToMany(CategoriesModel, {
  through: BlogsCategoriesModel,
  foreignKey: { name: "blogId", allowNull: false },
})
CategoriesModel.belongsToMany(BlogsModel, {
  through: BlogsCategoriesModel,
  foreignKey: { name: "categoryId", allowNull: false },
})

export default BlogsModel
