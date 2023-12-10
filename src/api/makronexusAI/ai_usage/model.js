import { DataTypes } from "sequelize";
import sequelize from "../../../db.js";
import UserModel from "../../users/model.js";

const UserFeatureUsageModel = sequelize.define("user_feature_usage", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  feature_type: {
    type: DataTypes.ENUM("conversation", "image_generation", "image_interpretation", "text_to_voice"),
    allowNull: false
  },
  current_month_usage_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  total_usage_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  last_used_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
});

// Associations
UserFeatureUsageModel.belongsTo(UserModel, { foreignKey: 'user_id' });
UserModel.hasMany(UserFeatureUsageModel, { foreignKey: 'user_id' });

export default UserFeatureUsageModel;
