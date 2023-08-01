import { DataTypes } from "sequelize";
import sequelize from "../../db.js";
import ApplicantModel from "../applicants/model.js";
import SchoolModel from "../schools/model.js";
import ApplicationSchoolModel from "../intermediate_tables/application_school.js";

const ApplicationModel=sequelize.define("application",{
    id:{
        type:DataTypes.UUID,
        primaryKey:true,
        defaultValue:DataTypes.UUIDV4
    },
    application_status:{
        type:DataTypes.ENUM("pending","accepted","rejected","withdrawn","incomplete"),
        defaultValue:"pending"
    }
})
ApplicantModel.hasMany(ApplicationModel,{foreignKey:{allowNull:false}})
ApplicationModel.belongsTo(ApplicantModel)
SchoolModel.belongsToMany(ApplicationModel,{through:ApplicationSchoolModel,foreignKey:{allowNull:false}})
ApplicantModel.belongsToMany(SchoolModel,{through:ApplicationSchoolModel,foreignKey:{allowNull:false}})

export default ApplicationModel