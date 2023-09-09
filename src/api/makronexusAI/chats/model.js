import { DataTypes } from "sequelize";
import sequelize from "../../../db.js";
import UserModel from "../../users/model.js";
import users_AiChatModel from "../../intermediate_tables/usersAiChatModel.js";
import MakronexaQA from "../model.js";

const aiChatModel = sequelize.define("AiChat", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
});

aiChatModel.belongsToMany(UserModel, {
  through: users_AiChatModel,
  foreignKey: { allowNull: false, name: "chat_id" },
});
UserModel.belongsToMany(aiChatModel, {
  through: users_AiChatModel,
  foreignKey: { allowNull: false, name: "user_id" },
});
aiChatModel.hasMany(MakronexaQA, { foreignKey: "chat_id" });

export default aiChatModel;
