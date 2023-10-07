import { DataTypes } from "sequelize";
import sequelize from "../../db.js";
import UserModel from "../users/model.js";

const AddressModel = sequelize.define("address", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  street: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  building_number: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  apartment_number: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  postal_code: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  province: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  country: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type_of_settlement: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

// Define the associations with correct foreign keys
AddressModel.belongsTo(UserModel, { foreignKey: "user_id" }); 
UserModel.hasOne(AddressModel, { foreignKey: "user_id" });

export default AddressModel;
