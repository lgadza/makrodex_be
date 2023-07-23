import { DataTypes, UUIDV4 } from "sequelize";
import sequelize from "../../db.js";
import ApplicantModel from "../applicants/model.js";
import ApplicantAddressModel from "../intermediate_tables/applicant_address.js";
 const AddressModel=sequelize.define("address",{
    id:{
        type:DataTypes.UUID,
        primaryKey:true,
        defaultValue:DataTypes.UUIDV4
    },
    street:{
        type:DataTypes.STRING,
        allowNull:false
    },
    building_number:{
        type:DataTypes.STRING,
        allowNull:false
    },
    apartment_number:{
        type:DataTypes.STRING,
        allowNull:true
    },
    postal_code:{
        type:DataTypes.STRING,
        allowNull:true
    },
    city:{
        type:DataTypes.STRING,
        allowNull:false
    },
    province:{
        type:DataTypes.STRING,
        allowNull:false
    },
    country:{
        type:DataTypes.STRING,
        allowNull:false
    },
    type_of_settlement:{
        type:DataTypes.STRING,
        allowNull:false
    }

 })
 // many to many relationship. one applicant can have many address when they change address and one address can have many applicants living together
 AddressModel.belongsToMany(ApplicantModel, { through: ApplicantAddressModel, foreignKey: "address_id"});
 ApplicantModel.belongsToMany(AddressModel, { through: ApplicantAddressModel, foreignKey:"applicant_id"});

 export default AddressModel