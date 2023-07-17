import { DataTypes } from "sequelize";
import sequelize from "../../db.js";
import ParentModel from "./model.js";
import ParentApplicant from "../intermediate_tables/guardian_applicant.js";

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
ParentModel.belongsToMany(GuardianTypeModel,{through:ParentApplicant,foreignKey:{allowNull:false}})
GuardianTypeModel.belongsToMany(ParentModel,{through:ParentApplicant,foreignKey:{allowNull:false}})
export default GuardianTypeModel