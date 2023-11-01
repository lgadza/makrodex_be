// File: models/UserSubscription.ts
import { DataTypes } from 'sequelize';
import sequelize from '../../db';



const UserSubscription = sequelize.define('UserSubscription', {
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  stripeSubscriptionId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  stripeCustomerId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  stripePriceId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  stripeCurrentPeriodEnd: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});

export default UserSubscription;
