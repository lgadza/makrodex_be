import { DataTypes } from "sequelize";
import sequelize from "../../db.js";
import ApplicantModel from "../admissions/applicants/model.js";
import ParentApplicant from "../intermediate_tables/parent_applicant.js";

const ParentsModel = sequelize.define("parent", {
  parent_id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  parent_first_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  parent_last_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  date_of_birth: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  relationship: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  state: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  country: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone_number: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

ParentsModel.belongsToMany(ApplicantModel, {
  through: "ParentApplicant", // Intermediate table name
  foreignKey: "parent_id", // Foreign key column name in the intermediate table
  otherKey: "applicant_id", // Foreign key column name in the intermediate table for the ApplicantModel
});

ApplicantModel.belongsToMany(ParentsModel, {
  through: ParentApplicant, // Intermediate table name
  foreignKey: "applicant_id", // Foreign key column name in the intermediate table
  otherKey: "parent_id", // Foreign key column name in the intermediate table for the ParentsModel
});

export default ParentsModel;
