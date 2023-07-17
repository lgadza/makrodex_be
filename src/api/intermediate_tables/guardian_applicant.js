import { DataTypes } from "sequelize";
import sequelize from "../../db.js";

const GuardianApplicant = sequelize.define("applicant_guardian", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
});

export default GuardianApplicant;
