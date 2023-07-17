import { DataTypes } from "sequelize";
import sequelize from "../../db.js";
import ApplicantModel from "../applicants/model.js";

const ApplicationModel=sequelize.define("application",{
    id:{
        type:DataTypes.UUID,
        primaryKey:true,
        defaultValue:DataTypes.UUIDV4
    },
    application_status:{
        type:DataTypes.ENUM("pending","accepted","rejected","withdrawn","incomplete")
    }
})
ApplicantModel.hasMany(ApplicationModel,{foreignKey:{allowNull:false}})
ApplicationModel.belongsTo(ApplicantModel)

export default ApplicationModel