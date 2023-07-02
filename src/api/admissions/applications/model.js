import { DataTypes } from "sequelize";
import sequelize from "../../../db.js";
import ParentsModel from "../../parents/model.js";
import SchoolModel from "../../schools/model.js"; 
import ApplicantModel from "../applicants/model.js";
const ApplicationModel = sequelize.define("application", {
  application_id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  applicant_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  application_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("pending", "accepted", "rejected"),
    allowNull: false,
  },
});

ApplicationModel.belongsTo(SchoolModel, {
  foreignKey: "school_id", 
  allowNull: false, 
});
ApplicationModel.belongsTo(ApplicantModel, {
  foreignKey: "applicant_id", 
  allowNull: false, 
});

ApplicationModel.hasMany(ParentsModel, { foreignKey: "parent_id" });
ParentsModel.belongsToMany(ApplicationModel, {
  through: ApplicationModel,
});

export default ApplicationModel;
