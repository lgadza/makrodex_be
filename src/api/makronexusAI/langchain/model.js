import { DataTypes } from "sequelize";
import sequelize from "../../../db.js";
import UserModel from "../../users/model.js";
import UserAISettingsModel from "../userAISettings/model.js";
const DatasetChatModel=sequelize.define("dataset_chat",{
   
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
      }
})
const aiChatModel = sequelize.define("AiChat", {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
  });
DatasetChatModel.belongsTo(UserModel, { foreignKey: "user_id" });
UserModel.hasMany(DatasetChatModel, {
  foreignKey: { allowNull: false, name: "user_id" },
});
DatasetChatModel.belongsTo(aiChatModel, {  foreignKey:{allowNull:false,name:"chat_id"} });

DatasetChatModel.belongsTo(UserAISettingsModel, {foreignKey:{allowNull:false,name:"dataset_id"} });
UserAISettingsModel.hasMany(DatasetChatModel, {
  foreignKey: { allowNull: false, name: "dataset_id" },
});

export default DatasetChatModel