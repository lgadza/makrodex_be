import { DataTypes } from 'sequelize';
import sequelize from '../../../db.js';
import UserModel from '../../users/model.js'; 
import GroupModel from '../groups/model.js'; 
export const RequestType = {
    FRIEND: 'friend',
    GROUP_JOIN: 'group_join',
    
};

export const RequestStatus = {
    PENDING: 'pending',
    ACCEPTED: 'accepted',
    DECLINED: 'declined',
    
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
        allowNull: true, 
        references: {
            model: UserModel,
            key: 'id'
        }
    },
    group_id: { 
        type: DataTypes.UUID,
        allowNull: true, 
        references: {
            model: GroupModel,
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
    timestamps: true,
    paranoid: true,
    indexes: [
        { fields: ['sender_user_id'] },
        { fields: ['receiver_user_id'] },
        { fields: ['group_id'] }
    ]
});

// Associations
RequestModel.belongsTo(UserModel, { as: 'sender', foreignKey: 'sender_user_id' });
RequestModel.belongsTo(UserModel, { as: 'receiver', foreignKey: 'receiver_user_id' });
RequestModel.belongsTo(GroupModel, { as: 'group', foreignKey: 'group_id' }); // New association for group

export default RequestModel;
