import { DataTypes } from "sequelize";
import sequelize from "../../db.js";
import UserModel from "../users/model.js";
import StudentMakronexaQA from "../intermediate_tables/students_makronexaQAs.js";
import MakronexaQA from "./model.js";

const AiResponse = sequelize.define("ai_response", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  type: {
    type: DataTypes.ENUM("text", "image", "video"),
    allowNull: false,
    defaultValue: "text",
  },
  content: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  model: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});



export default AiResponse;
