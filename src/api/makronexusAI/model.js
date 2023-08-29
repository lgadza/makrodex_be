import { DataTypes } from "sequelize";
import sequelize from "../../db.js";
import ParentsModel from "../guardians/model.js";
import ApplicantModel from "../applicants/model.js";
// import StudentMakronexaQA from "../intermediate_tables/students_makronexaQAs.js";
// import aiChatModel from "./aiChatModel.js";
const MakronexaQA=sequelize.define("makronexaQA",{
   
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      type: {
        type: DataTypes.ENUM("text","image","video"),
        allowNull: false,
        defaultValue:"text"
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      model: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      from:{
        type:DataTypes.ENUM("makronexa","user"),
        allowNull:false,
        defaultValue:"makronexa"

      },
      liked:{
        type:DataTypes.BOOLEAN,
        allowNull:false,
        defaultValue:false
      },
      disliked:{
        type:DataTypes.ENUM("true","false","no-comment"),
        allowNull:false,
        defaultValue:"no-comment"

      }
  
})
const aiChatModel = sequelize.define("AiChat", {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
  });
MakronexaQA.belongsTo(ApplicantModel, { foreignKey: "user_id" });
ApplicantModel.hasMany(MakronexaQA, {
  foreignKey: { allowNull: false, name: "user_id" },
});
// aiChatModel.hasMany(MakronexaQA,{ foreignKey:{allowNull:false,name:"chat_id"} });
MakronexaQA.belongsTo(aiChatModel, {  foreignKey:{allowNull:false,name:"chat_id"} });

export default MakronexaQA