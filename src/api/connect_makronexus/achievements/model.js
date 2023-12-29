import { DataTypes } from 'sequelize';
import sequelize from '../../../db.js';  // Adjust the path as needed for your project structure
import UserModel from '../../users/model.js';  // Adjust the path to the User model

const AchievementModel = sequelize.define('achievement', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: UserModel,
            key: 'id'
        }
    },
    achievement_title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    date_earned: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    // Optional settings
    timestamps: true,  // Tracks createdAt and updatedAt automatically
    paranoid: true,    // Enable soft deletes
    // Indexes for performance optimization
    indexes: [
        {
            fields: ['user_id'],
        }
    ]
});

// Associations
AchievementModel.belongsTo(UserModel, { as: 'user', foreignKey: 'user_id' });

export default AchievementModel;
