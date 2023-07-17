import { DataTypes } from "sequelize";
import sequelize from "../../db.js";

const ApplicantAddressModel = sequelize.define("applicant_address", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
});

export default ApplicantAddressModel;
