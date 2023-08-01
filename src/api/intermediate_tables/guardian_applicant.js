import { DataTypes } from "sequelize";
import sequelize from "../../db.js";
import GuardianModel from "../guardians/model.js";
import ApplicantModel from "../applicants/model.js";

const GuardianApplicant = sequelize.define("applicant_guardian", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
});
const associateModels = () => {

  //  many-to-many relationship between GuardianModel and ApplicantModel
  GuardianModel.belongsToMany(ApplicantModel, {
    through: GuardianApplicant,
    foreignKey: { allowNull: false, name: "guardian_id" },
  });
  ApplicantModel.belongsToMany(GuardianModel, {
    through: GuardianApplicant,
    foreignKey: { allowNull: false, name: "applicant_id" },
  });
};
export {GuardianApplicant,associateModels} ;
