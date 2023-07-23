import { DataTypes } from "sequelize";
import sequelize from "../../db.js";
import ApplicantModel from "../applicants/model.js";
import AddressModel from "../address/model.js";

const ApplicantAddressModel = sequelize.define("applicant_address", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
});


export default ApplicantAddressModel;
