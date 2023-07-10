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
  first_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  last_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  
  country_code: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  
  relationship: {
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
