import { DataTypes } from 'sequelize';
import sequelize from '../../../db.js';
import PostModel from '../posts/model.js';
import UserModel from '../../users/model.js';

const LikeModel = sequelize.define('like', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    post_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: PostModel,
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
    }
}, {
    // Optional settings
    timestamps: true, 
    indexes: [
        {
            fields: ['post_id'],
        },
        {
            fields: ['user_id'],
        }
    ]
});

// Associations
// Associations
LikeModel.belongsTo(PostModel, { as: 'post', foreignKey: 'post_id' });
PostModel.hasMany(LikeModel, {
    foreignKey: 'post_id', 
    as: 'likes', 
});

LikeModel.belongsTo(UserModel, { as: 'user', foreignKey: 'user_id' });
UserModel.hasMany(LikeModel, {
    foreignKey: 'user_id', 
    as: 'likes', 
});

export default LikeModel;
