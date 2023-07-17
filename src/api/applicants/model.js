import { DataTypes } from "sequelize";
import bcrypt from "bcrypt";
import sequelize from "../../db.js";
// import GuardianModel from "../guardians/model.js";
import GuardianApplicant from "../intermediate_tables/guardian_applicant.js";
import AddressModel from "../address/model.js";
import ApplicantAddressModel from "../intermediate_tables/applicant_address.js";
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
    relationship:{
        type:DataTypes.STRING,
        allowNull:false
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
   
  });
  
  GuardianModel.beforeCreate(async (guardian) => {
    const schoolId = "BC-FHS-0001";
    const lastGuardian = await GuardianModel.findOne({
      order: [["createdAt", "DESC"]],
    });
  
    let guardianNumber = 1;
    if (lastGuardian) {
      const lastGuardianId = lastGuardian.guardian_id;
      const lastNumber = parseInt(lastGuardianId.split("_")[1]);
      guardianNumber = lastNumber + 1;
    }
  
    const formattedGuardianNumber = String(guardianNumber).padStart(3, "0");
    guardian.guardian_id = `${schoolId}_${formattedGuardianNumber}`;
  });

const ApplicantModel = sequelize.define("applicant", {
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
  const schoolId = "BC-FHS-0001";
  const lastApplicant = await ApplicantModel.findOne({
    order: [["createdAt", "DESC"]],
  });

  let applicantNumber = 1;
  if (lastApplicant) {
    const lastApplicantId = lastApplicant.id;
    const lastNumber = parseInt(lastApplicantId.split("_")[1]);
    applicantNumber = lastNumber + 1;
  }

  const formattedApplicantNumber = String(applicantNumber).padStart(3, "0");
  applicant.id = `${schoolId}_${formattedApplicantNumber}`;

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
// 1 to many relationship. one address can have many applicants but one applicant can have one address
// AddressModel.hasMany(ApplicantModel,{foreignKey:{name:"address_id",allowNull:false}})
// ApplicantModel.belongsTo(AddressModel)

// many to many relationship. one applicant can have many applicants and one guardian can have many applicants

ApplicantModel.belongsToMany(GuardianModel, { through: GuardianApplicant, foreignKey: {name:"applicant_id" ,allowNull:false} });
GuardianModel.belongsToMany(ApplicantModel, { through: GuardianApplicant, foreignKey: {name:"guardian_id_id" ,allowNull:false} });

// many to many relationship. one applicant can have many address when they change address and one address can have many applicants living together

ApplicantModel.belongsToMany(AddressModel, { through: ApplicantAddressModel, foreignKey: {name:"applicant_id" ,allowNull:false} });
AddressModel.belongsToMany(ApplicantModel, { through: ApplicantAddressModel, foreignKey: {name:"address_id" ,allowNull:false} });


export default ApplicantModel;