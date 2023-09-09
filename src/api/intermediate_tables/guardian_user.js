import { DataTypes } from "sequelize";
import sequelize from "../../db.js";
import GuardianModel from "../guardians/model.js";
import UserModel from "../users/model.js";

const GuardianUser = sequelize.define("user_guardian", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
});
const associateModels = () => {

  //  many-to-many relationship between GuardianModel and UserModel
  GuardianModel.belongsToMany(UserModel, {
    through: GuardianUser,
    foreignKey: { allowNull: false, name: "guardian_id" },
  });
  UserModel.belongsToMany(GuardianModel, {
    through: GuardianUser,
    foreignKey: { allowNull: false, name: "user_id" },
  });
};
export {GuardianUser,associateModels} ;
