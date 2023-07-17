import { DataTypes } from "sequelize";
import sequelize from "../../db.js";

const ApplicationSchoolModel = sequelize.define("application_school", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
});

export default ApplicationSchoolModel;
