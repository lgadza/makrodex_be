import { DataTypes } from "sequelize";
import bcrypt from "bcrypt";
import sequelize from "../../db.js";
import AddressModel from "../address/model.js";
import {GuardianApplicant, associateModels } from "../intermediate_tables/guardian_applicant.js";
import GuardianModel from "../guardians/model.js";

const ApplicantModel = sequelize.define("applicant", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue:DataTypes.UUIDV4

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
  role: {
    type: DataTypes.ENUM("student","teacher","social worker","guidance counselor","bus driver","security personnel","technology coordinator","sports coach"),
    allowNull: true,
    defaultValue:"student"
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  // policy_acceptance: {
  //   type: DataTypes.BOOLEAN,
  //   allowNull: false,
  // },
  data_process_acceptance: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
 
});

ApplicantModel.beforeCreate(async (applicant) => {
// CUSTOM ID
  // const schoolId = "BC-FHS-0001";
  // const lastApplicant = await ApplicantModel.findOne({
  //   order: [["createdAt", "DESC"]],
  // });

  // let applicantNumber = 1;
  // if (lastApplicant) {
  //   const lastApplicantId = lastApplicant.id;
  //   const lastNumber = parseInt(lastApplicantId.split("_")[1]);
  //   applicantNumber = lastNumber + 1;
  // }

  // const formattedApplicantNumber = String(applicantNumber).padStart(3, "0");
  // applicant.id = `${schoolId}_${formattedApplicantNumber}`;

  const plainPassword = applicant.password;
  const hashedPassword = await bcrypt.hash(plainPassword, 10);
  applicant.password = hashedPassword;
});

ApplicantModel.checkCredentials = async function (email, password) {
  const applicant = await this.findOne({ where: { email } });

  if (applicant) {
    const passwordMatch = await bcrypt.compare(password, applicant.password);

    if (passwordMatch) {
      return applicant;
    } else {
      return null;
    }
  } else {
    return null;
  }
};
// ApplicantModel.belongsToMany(GuardianModel, {
//   through: GuardianApplicant,
//   foreignKey: { allowNull: false, name: "applicant_id" },
// });
// ApplicantModel.hasOne(AddressModel, { foreignKey: "applicant_id" });
// AddressModel.belongsTo(ApplicantModel, { foreignKey: "applicant_id" });

export default ApplicantModel;

