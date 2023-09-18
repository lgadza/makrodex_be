import { DataTypes } from "sequelize";
import sequelize from "../../../db.js";
import UserAISettingsModel from "../userAISettings/model.js";

const AIFileModel = sequelize.define("ai_file", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  size: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
});

UserAISettingsModel.hasMany(AIFileModel, { foreignKey: "userAISettings_id" });
AIFileModel.belongsTo(UserAISettingsModel, { foreignKey: "userAISettings_id" });

export default AIFileModel;
