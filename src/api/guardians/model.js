import { DataTypes } from "sequelize";
import bcrypt from "bcrypt";
import sequelize from "../../db.js";
import ApplicantModel from "../applicants/model.js";
import GuardianApplicant from "../intermediate_tables/guardian_applicant.js";

const GuardianModel = sequelize.define("guardian", {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  first_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  last_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  gender: {
    type: DataTypes.ENUM("male", "female"),
    allowNull: false,
  },
  citizenship: {
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
  relationship: { 
    type: DataTypes.STRING, 
    allowNull: true
  },
  candidate_id: {
    type: DataTypes.STRING,
    allowNull: false,
    foreignKey:true,
  },
  
});

GuardianModel.beforeCreate(async (guardian) => {
  const schoolId = "BC-FHS-0001";
  const lastGuardian = await GuardianModel.findOne({
    order: [["createdAt", "DESC"]],
  });

  let guardianNumber = 1;
  if (lastGuardian) {
    const lastGuardianId = lastGuardian.id;
    const lastNumber = parseInt(lastGuardianId.split("_")[1]);
    guardianNumber = lastNumber + 1;
  }

  const formattedGuardianNumber = String(guardianNumber).padStart(3, "0");
  guardian.id = `${schoolId}_${formattedGuardianNumber}`;
});
// many to many relationship. one applicant can have many applicants and one guardian can have many applicants

GuardianModel.belongsToMany(ApplicantModel, { through: GuardianApplicant, foreignKey: {name:"applicant_id" ,allowNull:false}});
ApplicantModel.belongsToMany(GuardianModel, { through: GuardianApplicant, foreignKey: {name:"candidate_id" ,allowNull:false}});

export default GuardianModel;
