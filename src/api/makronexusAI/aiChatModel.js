// models/Chat.js
import { DataTypes } from "sequelize";
import sequelize from "../../db.js";
import UserModel from "../users/model.js";
import MakronexaQA from "./model.js";

const aiChatModel = sequelize.define("aichat", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
});
aiChatModel.belongsToMany(UserModel, {
  through: "users_aiChat",
  foreignKey: { allowNull: false, name: "chat_id" },
});

UserModel.belongsToMany(aiChatModel, {
  through: "users_aiChat",
  foreignKey: { allowNull: false, name: "user_id" },
});

  export default aiChatModel;
