import { DataTypes } from 'sequelize';
import sequelize from '../../../db.js';  // Adjust the path as needed for your project structure
import UserModel from '../../users/model.js';  // Adjust the path to the User model
import GroupModel from '../../groups/model.js';  // Adjust the path to the Group model
const MemberRoles = {
    ADMIN: 'Admin',
    MEMBER: 'Member',
    // Add more roles as needed
};
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
    join_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    member_role: {
        type: DataTypes.ENUM(Object.values(MemberRoles)),
        allowNull: false,
        defaultValue: MemberRoles.MEMBER,  
    },
    last_activity_date: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    // Optional settings
    timestamps: true,  // Tracks createdAt and updatedAt automatically
    // Indexes for performance optimization
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
