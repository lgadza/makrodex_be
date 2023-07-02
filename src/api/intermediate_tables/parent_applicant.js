import { DataTypes } from "sequelize";
import sequelize from "../../db.js";

const ParentApplicant = sequelize.define("ParentApplicant", {
  parentApplicant_id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
});

export default ParentApplicant;
