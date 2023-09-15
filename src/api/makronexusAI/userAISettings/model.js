import { DataTypes } from "sequelize";
import sequelize from "../../../db.js";
import UserModel from "../../users/model.js";

const UserAISettingsModel = sequelize.define("user_ai_setting", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  shared: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  dataset_name: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "Makronexus_EduCenter",
  },
  temperature: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue:0
  },
  model: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  personality: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});


UserModel.hasMany(UserAISettingsModel, { foreignKey: { allowNull: false, name: "user_id" } });
UserAISettingsModel.belongsTo(UserModel, { foreignKey: { allowNull: false, name: "user_id" } });

export default UserAISettingsModel;
