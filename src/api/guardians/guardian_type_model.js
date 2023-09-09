import { DataTypes } from "sequelize";
import sequelize from "../../db.js";
import ParentModel from "./model.js";
import {GuardianUser} from "../intermediate_tables/guardian_user.js";

const GuardianTypeModel=sequelize.define("guardian_type",{
    id:{
        type:DataTypes.UUID,
        primaryKey:true,
        defaultValue:DataTypes.UUIDV4
    },
    relationship:{
        type:DataTypes.STRING,
        allowNull:false,
        unique:true
        
    }
})
ParentModel.belongsToMany(GuardianTypeModel,{through:GuardianUser,foreignKey:{allowNull:false}})
GuardianTypeModel.belongsToMany(ParentModel,{through:GuardianUser,foreignKey:{allowNull:false}})
export default GuardianTypeModel