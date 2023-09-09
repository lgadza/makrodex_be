import { DataTypes } from "sequelize";
import sequelize from "../../db.js";
import UserModel from "../users/model.js";
import AddressModel from "../address/model.js";

const UserAddressModel = sequelize.define("user_address", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
});


export default UserAddressModel;
