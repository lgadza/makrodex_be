import { DataTypes } from "sequelize";
import sequelize from "../../db.js";

const users_AiChatModel = sequelize.define("users_aiChat", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
});

export default users_AiChatModel;
