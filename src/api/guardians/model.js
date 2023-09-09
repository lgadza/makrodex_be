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
});

// GuardianModel.beforeCreate(async (guardian) => {
//   const schoolId = "BC-FHS-0001";
//   const lastGuardian = await GuardianModel.findOne({
//     order: [["createdAt", "DESC"]],
//   });

//   let guardianNumber = 1;
//   if (lastGuardian) {
//     const lastGuardianId = lastGuardian.id;
//     const lastNumber = parseInt(lastGuardianId.split("_")[1]);
//     guardianNumber = lastNumber + 1;
//   }

//   const formattedGuardianNumber = String(guardianNumber).padStart(3, "0");
//   guardian.id = `${schoolId}_${formattedGuardianNumber}`;
// });
// many to many relationship. one user can have many users and one guardian can have many users

// associateModels()
GuardianModel.belongsToMany(UserModel, {
  through: GuardianUser,
  foreignKey: { allowNull: false, name: "guardian_id" },
});


export default GuardianModel;
