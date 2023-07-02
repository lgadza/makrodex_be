import { DataTypes } from "sequelize";
import sequelize from "../../../db.js";
import ParentsModel from "../../parents/model.js";
import ApplicationModel from "../applications/model.js";

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
  date_of_birth: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  gender: {
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
  province: {
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

ApplicantModel.hasMany(ParentsModel, { foreignKey: "applicant_id" });
ParentsModel.belongsTo(ApplicantModel);

ApplicantModel.hasMany(ApplicationModel, { foreignKey: "applicant_id" });
ApplicationModel.belongsTo(ApplicantModel);

export default ApplicantModel;
