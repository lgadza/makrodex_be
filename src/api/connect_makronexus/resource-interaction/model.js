import { DataTypes } from 'sequelize';
import sequelize from '../../../db.js';  // Adjust the path as needed for your project structure
import UserModel from '../../users/model.js';  // Adjust the path to the User model
import ResourceModel from '../../resources/model.js';  // Adjust the path to the Resource model

const ResourceInteractionModel = sequelize.define('resource_interaction', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    resource_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: ResourceModel,
            key: 'id'
        }
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: UserModel,
            key: 'id'
        }
    },
    interaction_type: {
        type: DataTypes.STRING,
        allowNull: false  // Possible values: 'download', 'view', etc.
    },
    timestamp: {
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
            fields: ['resource_id'],
        },
        {
            fields: ['user_id'],
        }
    ]
});

// Associations
ResourceInteractionModel.belongsTo(ResourceModel, { as: 'resource', foreignKey: 'resource_id' });
ResourceInteractionModel.belongsTo(UserModel, { as: 'user', foreignKey: 'user_id' });

export default ResourceInteractionModel;
