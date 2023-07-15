import { DataTypes } from "sequelize";
import bcrypt from "bcrypt";
import sequelize from "../../../db.js";
// import ParentModel from "../../parents/model.js";
import ParentApplicant from "../../intermediate_tables/parent_applicant.js";
const ParentModel = sequelize.define("parent", {
    parent_id: {
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
    candidate_id: {
      type: DataTypes.STRING,
      allowNull: false,
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

const ApplicantModel = sequelize.define("candidate", {
  candidate_id: {
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
  settlement_type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

ApplicantModel.beforeCreate(async (candidate) => {
  const schoolId = "BC-FHS-0001";
  const lastCandidate = await ApplicantModel.findOne({
    order: [["createdAt", "DESC"]],
  });

  let candidateNumber = 1;
  if (lastCandidate) {
    const lastCandidateId = lastCandidate.candidate_id;
    const lastNumber = parseInt(lastCandidateId.split("_")[1]);
    candidateNumber = lastNumber + 1;
  }

  const formattedCandidateNumber = String(candidateNumber).padStart(3, "0");
  candidate.candidate_id = `${schoolId}_${formattedCandidateNumber}`;

  const plainPassword = candidate.password;
  const hashedPassword = await bcrypt.hash(plainPassword, 10);
  candidate.password = hashedPassword;
});

ApplicantModel.belongsToMany(ParentModel, { through: ParentApplicant, foreignKey: "candidate_id" });
ParentModel.belongsToMany(ApplicantModel, { through: ParentApplicant, foreignKey: "parent_id" });

ParentModel.belongsToMany(ApplicantModel, { through: ParentApplicant, foreignKey: "parent_id" });
ApplicantModel.belongsToMany(ParentModel, { through: ParentApplicant, foreignKey: "candidate_id" });
export default ApplicantModel;
