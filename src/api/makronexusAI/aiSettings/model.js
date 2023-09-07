import { DataTypes } from "sequelize";
import sequelize from "../../../db.js";
import ApplicantModel from "../../applicants/model.js";
const AiSettings=sequelize.define("aiSettings",{
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      temperature: {
        type: DataTypes.DECIMAL,
        allowNull: false,
      },
      personality: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      tittle: {
        type: DataTypes.STRING,
        allowNull: false,
      },
     
  
})

AiSettings.hasMany(ApplicantModel, {
    foreignKey: { allowNull: true, name: "aiSettings_id" },
});
ApplicantModel.belongsTo(AiSettings, { foreignKey: "aiSettings_id" });

export default AiSettings