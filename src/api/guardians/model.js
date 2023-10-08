import { DataTypes } from "sequelize";
import bcrypt from "bcrypt";
import sequelize from "../../db.js";
import { GuardianUser,associateModels } from "../intermediate_tables/guardian_user.js";
import UserModel from "../users/model.js";

const GuardianModel = sequelize.define("guardian", {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    defaultValue:DataTypes.UUIDV4,
  },
  first_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  last_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  citizenship: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone_number: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  checked: {
    type: DataTypes.BOOLEAN,
    defaultValue:false
  },
});


// associateModels()
GuardianModel.belongsTo(UserModel, {
  foreignKey: { allowNull: false, name: "user_id" },
});
UserModel.hasOne(GuardianModel, { foreignKey: "user_id" });


export default GuardianModel;
