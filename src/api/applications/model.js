import { DataTypes } from "sequelize";
import sequelize from "../../db.js";
import UserModel from "../users/model.js";
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
UserModel.hasMany(ApplicationModel,{foreignKey:{allowNull:false}})
ApplicationModel.belongsTo(UserModel)
SchoolModel.belongsToMany(ApplicationModel,{through:ApplicationSchoolModel,foreignKey:{allowNull:false}})
UserModel.belongsToMany(SchoolModel,{through:ApplicationSchoolModel,foreignKey:{allowNull:false}})

export default ApplicationModel