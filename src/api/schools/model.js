import { DataType } from "sequelize-typescript";
import sequelize from "../../../db";
import ParentsModel from "../parents/model";
import ApplicantModel from "../applicants/model";
const SchoolModel=sequelize.define("school",{
   
    school_id: {
        type: DataType.UUID,
        primaryKey: true,
        defaultValue: DataType.UUIDV4,
      },
      school_name: {
        type: DataType.STRING,
        allowNull: false,
      },
      address: {
        type: DataType.STRING,
        allowNull: false,
      },
      city: {
        type: DataType.STRING,
        allowNull: false,
      },
      province: {
        type: DataType.STRING,
        allowNull: false,
      },
      country: {
        type: DataType.STRING,
        allowNull: false,
      },
      phone_number: {
        type: DataType.STRING,
        allowNull: false,
      },
      email: {
        type: DataType.STRING,
        allowNull: false,
      },
})


export default SchoolModel