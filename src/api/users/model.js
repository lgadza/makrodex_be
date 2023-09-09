import { DataTypes } from "sequelize";
import bcrypt from "bcrypt";
import sequelize from "../../db.js";
import AddressModel from "../address/model.js";
import {GuardianUser, associateModels } from "../intermediate_tables/guardian_user.js";
import GuardianModel from "../guardians/model.js";

const UserModel = sequelize.define("user", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue:DataTypes.UUIDV4

  },
  first_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  last_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  // second_name: {
  //   type: DataTypes.STRING,
  //   allowNull: true,
  // },
  // date_of_birth: {
  //   type: DataTypes.DATEONLY,
  //   allowNull: false,
  // },
  gender: {
    type: DataTypes.ENUM("male", "female"),
    allowNull: false,
  },
  // citizenship: {
  //   type: DataTypes.STRING,
  //   allowNull: false,
  // },
  // phone_number: {
  //   type: DataTypes.STRING,
  //   allowNull: false,
  // },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  role: {
    type: DataTypes.ENUM("student","teacher","social worker","guidance counselor","bus driver","security personnel","technology coordinator","sports coach"),
    allowNull: true,
    defaultValue:"student"
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  // policy_acceptance: {
  //   type: DataTypes.BOOLEAN,
  //   allowNull: false,
  // },
  data_process_acceptance: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
 
});

UserModel.beforeCreate(async (user) => {
// CUSTOM ID
  // const schoolId = "BC-FHS-0001";
  // const lastUser = await UserModel.findOne({
  //   order: [["createdAt", "DESC"]],
  // });

  // let userNumber = 1;
  // if (lastUser) {
  //   const lastUserId = lastUser.id;
  //   const lastNumber = parseInt(lastUserId.split("_")[1]);
  //   userNumber = lastNumber + 1;
  // }

  // const formattedUserNumber = String(userNumber).padStart(3, "0");
  // user.id = `${schoolId}_${formattedUserNumber}`;

  const plainPassword = user.password;
  const hashedPassword = await bcrypt.hash(plainPassword, 10);
  user.password = hashedPassword;
});

UserModel.checkCredentials = async function (email, password) {
  const user = await this.findOne({ where: { email } });

  if (user) {
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (passwordMatch) {
      return user;
    } else {
      return null;
    }
  } else {
    return null;
  }
};
// UserModel.belongsToMany(GuardianModel, {
//   through: GuardianUser,
//   foreignKey: { allowNull: false, name: "user_id" },
// });
// UserModel.hasOne(AddressModel, { foreignKey: "user_id" });
// AddressModel.belongsTo(UserModel, { foreignKey: "user_id" });

export default UserModel;

