import { DataTypes } from 'sequelize';
import sequelize from '../../../db.js';  // Adjust the path as needed for your project structure
import UserModel from '../../users/model.js';  // Adjust the path to the User model

const GroupModel = sequelize.define('group', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    group_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    creation_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    group_owner_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: UserModel,
            key: 'id'
        }
    },
    group_privacy_setting: {
        type: DataTypes.STRING,
        allowNull: false  // Possible values: 'public', 'private'
    }
}, {
    // Optional settings
    timestamps: true,  // Tracks createdAt and updatedAt automatically
    // Indexes for performance optimization
    indexes: [
        {
            fields: ['group_owner_id'],
        }
    ]
});

// Associations
GroupModel.belongsTo(UserModel, { as: 'groupOwner', foreignKey: 'group_owner_id' });

export default GroupModel;
