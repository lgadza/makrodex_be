import { DataTypes } from "sequelize";
import sequelize from "../../db.js";

const StudentMakronexaQA = sequelize.define("student-makronexaQA", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
});

export default StudentMakronexaQA;
