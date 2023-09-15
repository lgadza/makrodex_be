import { DataTypes } from "sequelize";
import sequelize from "../../../db.js";

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
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});


UserSettingsModel.hasMany(AIFileModel, { foreignKey: "userAISettings_id" });
AIFileModel.belongsTo(UserSettingsModel, { foreignKey: "userAISettings_id" });

export default AIFileModel;
