import { DataTypes } from 'sequelize';
import sequelize from '../../../db.js';  // Adjust the path as needed for your project structure
import UserModel from '../../users/model.js';  // Adjust the path to the User model

const UserSettingsModel = sequelize.define('user_settings', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: UserModel,
            key: 'id'
        }
    },
    notification_settings: {
        type: DataTypes.JSON,  // Or DataTypes.STRING based on your preference
        allowNull: true
    },
    privacy_settings: {
        type: DataTypes.STRING,
        allowNull: true
    },
    theme_settings: {
        type: DataTypes.STRING,
        allowNull: true
    },
    language_preference: {
        type: DataTypes.STRING,
        allowNull: true
    },
    other_custom_settings: {
        type: DataTypes.JSON,  // Or DataTypes.STRING based on your preference
        allowNull: true
    }
}, {
    // Optional settings
    timestamps: true,  // If you want to track createdAt and updatedAt
    indexes: [
        {
            fields: ['user_id']
        }
    ]
});

// Associations
UserSettingsModel.belongsTo(UserModel, { as: 'user', foreignKey: 'user_id' });

export default UserSettingsModel;
