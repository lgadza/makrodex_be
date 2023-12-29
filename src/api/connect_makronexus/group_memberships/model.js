import { DataTypes } from 'sequelize';
import sequelize from '../../../db.js';
import GroupModel from '../groups/model.js';
import UserModel from '../../users/model.js';
 

const GroupMembershipModel = sequelize.define('group_membership', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    group_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: GroupModel,
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
    member_role: {
        type: DataTypes.ENUM('Admin', 'Member'),  
        allowNull: false,
        defaultValue: 'Member',  
    },
    last_activity_date: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    timestamps: true, 
    indexes: [
        {
            fields: ['group_id'],
        },
        {
            fields: ['user_id'],
        }
    ]
});

// Associations
GroupMembershipModel.belongsTo(GroupModel, { as: 'group', foreignKey: 'group_id' });
GroupMembershipModel.belongsTo(UserModel, { as: 'user', foreignKey: 'user_id' });

export default GroupMembershipModel;
