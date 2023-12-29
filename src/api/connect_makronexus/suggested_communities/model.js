import { DataTypes } from 'sequelize';
import sequelize from '../../../db.js';  // Adjust the path as needed for your project structure
import UserModel from '../../users/model.js';  // Adjust the path to the User model
import GroupModel from '../../groups/model.js';  // Adjust the path to the Group model

const SuggestedCommunityModel = sequelize.define('suggested_community', {
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
    group_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: GroupModel,
            key: 'id'
        }
    },
    suggestion_reason: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    suggestion_date: {
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
        },
        {
            fields: ['group_id'],
        }
    ]
});

// Associations
SuggestedCommunityModel.belongsTo(UserModel, { as: 'user', foreignKey: 'user_id' });
SuggestedCommunityModel.belongsTo(GroupModel, { as: 'group', foreignKey: 'group_id' });

export default SuggestedCommunityModel;
