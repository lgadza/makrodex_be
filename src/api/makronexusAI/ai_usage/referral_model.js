import { DataTypes } from "sequelize";
import sequelize from "../../../db.js";
import UserModel from "../../users/model.js";

const ReferralModel = sequelize.define("referral", {
    code: {
        type: DataTypes.STRING(8),
        primaryKey: true,
        allowNull: false,
        validate: {
          is: /^[a-zA-Z0-9]{8}$/,
        }
      },
  referrer_id: { // User who created the referral code
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: UserModel,
      key: 'id'
    },
    onDelete: 'CASCADE' 
  },
  referred_id: { // User who used the referral code
    type: DataTypes.UUID,
    allowNull: true, // Initially null until a user uses the code
    references: {
      model: UserModel,
      key: 'id'
    },
    onDelete: 'CASCADE' 
  }
},
{
    indexes: [{ unique: true, fields: ['code'] }],
    timestamps: true,
    paranoid: true
  });

// Associations
// A user can have many referral codes (as the referrer)
UserModel.hasMany(ReferralModel, { as: 'referrer', foreignKey: 'referrer_id' });
ReferralModel.belongsTo(UserModel, { as: 'referrer', foreignKey: 'referrer_id' });

// A user can be referred by many codes (as the referred user)
UserModel.hasMany(ReferralModel, { as: 'referred', foreignKey: 'referred_id' });
ReferralModel.belongsTo(UserModel, { as: 'referred', foreignKey: 'referred_id' });


export default ReferralModel;
