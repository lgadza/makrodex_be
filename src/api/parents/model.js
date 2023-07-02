import { DataTypes } from "sequelize";
import sequelize from "../../db.js";
import ParentApplicant from "../intermediate_tables/parent_applicant.js";
import ApplicantModel from "../admissions/applicants/model.js";

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

// ApplicantModel.hasMany(ParentsModel, { foreignKey: {allowNull:false} });
// ParentsModel.belongsToMany(ApplicantModel, {
//   through: ParentApplicant,
//   foreignKey: {allowNull:false},
// });

export default ParentsModel;
