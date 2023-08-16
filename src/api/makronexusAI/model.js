import { DataTypes } from "sequelize";
import sequelize from "../../db.js";
import ParentsModel from "../guardians/model.js";
import ApplicantModel from "../applicants/model.js";
import StudentMakronexaQA from "../intermediate_tables/students_makronexaQAs.js";
import AiResponse from "./aiResponseModel.js";
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
      content: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      model: {
        type: DataTypes.STRING,
        allowNull: true,
      },
  
})

MakronexaQA.belongsTo(ApplicantModel, { foreignKey: "applicant_id" });
ApplicantModel.belongsToMany(MakronexaQA, {
  through: StudentMakronexaQA,
  foreignKey: { allowNull: false, name: "applicant_id" },
  
});
// MakronexaQA.belongsTo(AiResponse, { foreignKey: "ai_id" });
// AiResponse.hasOne(MakronexaQA, { foreignKey: "ai_id" });
MakronexaQA.prototype.setAiResponse = async function (aiResponse) {
    this.ai_id = aiResponse.id;
    await this.save();
  };
  
  MakronexaQA.prototype.getAiResponse = async function () {
    const aiResponse = await AiResponse.findByPk(this.ai_id);
    return aiResponse;
  };


export default MakronexaQA