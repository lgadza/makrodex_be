import { DataTypes } from "sequelize";
import sequelize from "../../../db.js";
import ParentsModel from "../../parents/model.js";
import ApplicationModel from "../applications/model.js";
import ParentApplicant from "../../intermediate_tables/parent_applicant.js";

const ApplicantModel = sequelize.define("applicant", {
  applicant_id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  first_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  last_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  second_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  date_of_birth: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  gender: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  citizenship: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  street: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  building_number: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  apartment_number: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  postal_code: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  province: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  country: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone_number: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  settlement_type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  policy_acceptance: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  data_process_acceptance: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
});

// ParentsModel.hasMany(ApplicantModel, { 
//   foreignKey: {allowNull:false} });
// ApplicantModel.belongsToMany(ParentsModel,{
//   through:ParentApplicant,
//   foreignKey:{allowNull:false}
// });

// ApplicantModel.hasMany(ApplicationModel, { foreignKey: {allowNull:false} });
// ApplicationModel.belongsTo(ApplicantModel);

export default ApplicantModel;
