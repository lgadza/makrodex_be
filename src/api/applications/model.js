import { DataTypes } from "sequelize";
import sequelize from "../../db.js"; 
import UserModel from "../users/model.js";
import SchoolModel from "../schools/model.js";
import ApplicationSchoolModel from "../intermediate_tables/application_school.js";

const ApplicationModel = sequelize.define("application", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false, // Make sure the ID is not nullable
  },
  application_status: {
    type: DataTypes.ENUM("pending", "accepted", "rejected"),
    defaultValue: "pending",
    allowNull: false, // Make sure the status is not nullable
  },
  // Add more attributes related to applications if needed
});

// Define associations
UserModel.hasMany(ApplicationModel, {
  foreignKey: {
    name: 'user_id', 
    allowNull: false,
  },
});
ApplicationModel.belongsTo(UserModel, {
  foreignKey: {
    name: 'user_id',
    allowNull: false,
  },
});

// Define many-to-many relationship with schools through ApplicationSchoolModel
SchoolModel.belongsToMany(ApplicationModel, {
  through: ApplicationSchoolModel,
  foreignKey: {
    name: 'school_id', 
    allowNull: false,
  },
});
ApplicationModel.belongsToMany(SchoolModel, {
  through: ApplicationSchoolModel,
  foreignKey: {
    name: 'application_id',
    allowNull: false,
  },
});

export default ApplicationModel;
