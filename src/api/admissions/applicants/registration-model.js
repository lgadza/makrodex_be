import { DataTypes } from "sequelize";
import bcrypt from "bcrypt";
import sequelize from "../../../db.js";

const CandidateModel = sequelize.define("candidate", {
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
});

// Generate a custom candidate_id and hash the password before creating a new record
CandidateModel.beforeCreate(async (candidate) => {
    const schoolId = "BC-FHS-0001"; // Replace with the school ID provided from the frontend
    const lastCandidate = await CandidateModel.findOne({
      order: [["createdAt", "DESC"]],
    });
  
    let candidateNumber = 1;
    if (lastCandidate) {
      const lastCandidateId = lastCandidate.candidate_id;
      const lastNumber = parseInt(lastCandidateId.split("_")[1]); // Extract the last number from the candidate_id
      candidateNumber = lastNumber + 1;
    }
  
    const formattedCandidateNumber = String(candidateNumber).padStart(3, "0");
    candidate.candidate_id = `${schoolId}_${formattedCandidateNumber}`;

  const plainPassword = candidate.password;
  const hashedPassword = await bcrypt.hash(plainPassword, 10);
  candidate.password = hashedPassword;
});

export default CandidateModel;
