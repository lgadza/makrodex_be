import { DataTypes } from "sequelize";
import bcrypt from "bcrypt";
import sequelize from "../../db.js";
import ApplicantModel from "../applicants/model.js";
import ParentApplicant from "../intermediate_tables/parent_applicant.js";

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

ParentModel.belongsToMany(ApplicantModel, { through: ParentApplicant, foreignKey: "parent_id" });
ApplicantModel.belongsToMany(ParentModel, { through: ParentApplicant, foreignKey: "candidate_id" });

export default ParentModel;
