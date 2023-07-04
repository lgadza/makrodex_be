import { DataTypes } from "sequelize";
import sequelize from "../../db.js";
import ParentsModel from "../parents/model.js";
import ApplicantModel from "../admissions/applicants/model.js";
const SchoolModel=sequelize.define("school",{
   
    school_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      school_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      address: {
        type: DataTypes.STRING,
        allowNull: false,
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
      phone_number: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      school_type: {
        type: DataTypes.ENUM("private","public"),
        allowNull: false,
        
      },
      boarding_school: {
        type: DataTypes.ENUM("boarding","day"),
        allowNull: false,
        
      },
})


export default SchoolModel