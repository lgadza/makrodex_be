import { DataTypes } from "sequelize"
import sequelize from "../../../db.js"

const CategoriesModel = sequelize.define("category", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  category_name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
})

export default CategoriesModel
