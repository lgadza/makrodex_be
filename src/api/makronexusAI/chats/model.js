import { DataTypes } from "sequelize";
import sequelize from "../../../db.js";
import ApplicantModel from "../../applicants/model.js";
import users_AiChatModel from "../../intermediate_tables/usersAiChatModel.js";

const aiChatModel = sequelize.define("AiChat", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
});

aiChatModel.belongsToMany(ApplicantModel, {
  through: users_AiChatModel,
  foreignKey: { allowNull: false, name: "chat_id" },
});
ApplicantModel.belongsToMany(aiChatModel, {
  through: users_AiChatModel,
  foreignKey: { allowNull: false, name: "user_id" },
});

export default aiChatModel;
