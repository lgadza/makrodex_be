import { DataTypes } from "sequelize";
import sequelize from "../../../db.js";
import ParentsModel from "../../parents/model.js";

const ApplicationModel=sequelize.define("application",{
   
    application_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      first_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      last_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      application_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      address: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      
})
ApplicationModel.hasMany(ParentsModel,{foreignKey:"parent_id"});
ParentsModel.belongsToMany(ApplicationModel,{
    through:ApplicationModel,
    // foreignKey:{applicant_id:"applicant_id",allowNull:false}
});

export default ApplicationModel