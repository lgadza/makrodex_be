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
  country_code: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  date_of_birth: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  gender: {
    type: DataTypes.ENUM("male", "female"),
    allowNull: false,
  },
  citizenship: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  phone_number: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  avatar: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue:"https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
  },
  role: {
    type: DataTypes.ENUM("student","teacher","admin","social worker","guidance counselor","bus driver","security personnel","technology coordinator","sports coach","user"),
    allowNull: true,
    defaultValue:"user"
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

