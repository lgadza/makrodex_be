import { DataTypes } from "sequelize";
import bcrypt from "bcrypt";
import sequelize from "../../db.js";
import { GuardianApplicant,associateModels } from "../intermediate_tables/guardian_applicant.js";
import ApplicantModel from "../applicants/model.js";

const GuardianModel = sequelize.define("guardian", {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    defaultValue:DataTypes.UUIDV4,
  },
  first_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  last_name: {
    type: DataTypes.STRING,
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
});

// GuardianModel.beforeCreate(async (guardian) => {
//   const schoolId = "BC-FHS-0001";
//   const lastGuardian = await GuardianModel.findOne({
//     order: [["createdAt", "DESC"]],
//   });

//   let guardianNumber = 1;
//   if (lastGuardian) {
//     const lastGuardianId = lastGuardian.id;
//     const lastNumber = parseInt(lastGuardianId.split("_")[1]);
//     guardianNumber = lastNumber + 1;
//   }

//   const formattedGuardianNumber = String(guardianNumber).padStart(3, "0");
//   guardian.id = `${schoolId}_${formattedGuardianNumber}`;
// });
// many to many relationship. one applicant can have many applicants and one guardian can have many applicants

// associateModels()
GuardianModel.belongsToMany(ApplicantModel, {
  through: GuardianApplicant,
  foreignKey: { allowNull: false, name: "guardian_id" },
});


export default GuardianModel;
