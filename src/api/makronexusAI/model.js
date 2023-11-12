import { DataTypes } from "sequelize";
import sequelize from "../../db.js";
import ParentsModel from "../guardians/model.js";
import UserModel from "../users/model.js";
const MakronexaQA=sequelize.define("makronexaQA",{
   
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      type: {
        type: DataTypes.ENUM("text","imageUrl","video"),
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
      imageUrl:{
        type:DataTypes.STRING,
        allowNull:true,
      },
      fileUrl:{
        type:DataTypes.STRING,
        allowNull:true,
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
MakronexaQA.belongsTo(UserModel, { foreignKey: "user_id" });
UserModel.hasMany(MakronexaQA, {
  foreignKey: { allowNull: false, name: "user_id" },
});
MakronexaQA.belongsTo(aiChatModel, {  foreignKey:{allowNull:false,name:"chat_id"} });



export default MakronexaQA