import { DataTypes } from "sequelize";
import bcrypt from "bcrypt";
import sequelize from "../../db.js";
// import ParentModel from "../parents/model.js";
import ParentApplicant from "../intermediate_tables/parent_applicant.js";
import AddressModel from "../address/model.js";
const ParentModel = sequelize.define("parent", {
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
  
  ParentModel.beforeCreate(async (parent) => {
    const schoolId = "BC-FHS-0001";
    const lastParent = await ParentModel.findOne({
      order: [["createdAt", "DESC"]],
    });
  
    let parentNumber = 1;
    if (lastParent) {
      const lastParentId = lastParent.parent_id;
      const lastNumber = parseInt(lastParentId.split("_")[1]);
      parentNumber = lastNumber + 1;
    }
  
    const formattedParentNumber = String(parentNumber).padStart(3, "0");
    parent.parent_id = `${schoolId}_${formattedParentNumber}`;
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
// 1 to many relationship. one address can have many applicants but one applicant can have one address
AddressModel.hasMany(ApplicantModel,{foreignKey:{allowNull:false}})
ApplicantModel.belongsTo(AddressModel)

// many to many relationship. one applicant can have many applicants and one parent can have many applicants

ApplicantModel.belongsToMany(ParentModel, { through: ParentApplicant, foreignKey: {allowNull:false} });
ParentModel.belongsToMany(ApplicantModel, { through: ParentApplicant, foreignKey: {allowNull:false} });

// ParentModel.hasMany(ApplicantModel, { through: ParentApplicant,  foreignKey: {allowNull:false} });
// ApplicantModel.belongsToMany(ParentModel, { through: ParentApplicant,  foreignKey: {allowNull:false} });
export default ApplicantModel;