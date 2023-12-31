import { DataTypes } from 'sequelize';
import sequelize from '../../../db.js';  // Adjust the path as needed for your project structure
import UserModel from '../../users/model.js';  // Adjust the path to the User model

const FollowModel = sequelize.define('follow', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    follower_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: UserModel,
            key: 'id'
        }
    },
    following_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: UserModel,
            key: 'id'
        }
    },
    timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    // Optional settings
    timestamps: true,  // Tracks createdAt and updatedAt automatically
    // Indexes for performance optimization
    indexes: [
        {
            fields: ['follower_id'],
        },
        {
            fields: ['following_id'],
        }
    ]
});

// Associations
FollowModel.belongsTo(UserModel, { as: 'follower', foreignKey: 'follower_id' });
FollowModel.belongsTo(UserModel, { as: 'following', foreignKey: 'following_id' });
// UserModel.hasMany(FollowModel, { as: 'following', foreignKey: 'follower_id' });
// UserModel.hasMany(FollowModel, { as: 'followers', foreignKey: 'following_id' });


export default FollowModel;
