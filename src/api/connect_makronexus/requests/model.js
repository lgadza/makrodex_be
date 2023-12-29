import { DataTypes } from 'sequelize';
import sequelize from '../../../db.js';  // Adjust the path as needed for your project structure
import UserModel from '../../users/model.js';  // Adjust the path to the User model

// Define enums for request_type and request_status
const RequestType = {
    FRIEND: 'friend',
    GROUP_JOIN: 'group join',
    // Add more request types as needed
};

const RequestStatus = {
    PENDING: 'pending',
    ACCEPTED: 'accepted',
    DECLINED: 'declined',
    // Add more request statuses as needed
};

const RequestModel = sequelize.define('request', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    sender_user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: UserModel,
            key: 'id'
        }
    },
    receiver_user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: UserModel,
            key: 'id'
        }
    },
    request_type: {
        type: DataTypes.ENUM(Object.values(RequestType)),
        allowNull: false,
    },
    request_status: {
        type: DataTypes.ENUM(Object.values(RequestStatus)),
        allowNull: false,
    },
    request_date: {
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
            fields: ['sender_user_id'],
        },
        {
            fields: ['receiver_user_id'],
        }
    ]
});

// Associations
RequestModel.belongsTo(UserModel, { as: 'sender', foreignKey: 'sender_user_id' });
RequestModel.belongsTo(UserModel, { as: 'receiver', foreignKey: 'receiver_user_id' });

export default RequestModel;
