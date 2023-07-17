import { DataTypes } from "sequelize";
import sequelize from "../../db.js";
import ParentsModel from "../guardians/model.js";
import ApplicantModel from "../applicants/model.js";
const SchoolModel=sequelize.define("school",{
   
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      website: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      facebook: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phone_number: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      instagram: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      // school_type: {
      //   type: DataTypes.ENUM("private","public"),
      //   allowNull: false,
        
      // },
      // boarding_school: {
      //   type: DataTypes.ENUM("boarding","day"),
      //   allowNull: false,
        
      // },
})


export default SchoolModel