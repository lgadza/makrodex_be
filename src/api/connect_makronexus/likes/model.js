import { DataTypes } from 'sequelize';
import sequelize from '../../../db.js';  // Adjust the path as needed for your project structure
import UserModel from '../../users/model.js';  // Adjust the path to the User model
import PostModel from '../../posts/model.js';  // Adjust the path to the Post model

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
    timestamps: true,  // Tracks createdAt and updatedAt automatically
    // Indexes for performance optimization
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
LikeModel.belongsTo(PostModel, { as: 'post', foreignKey: 'post_id' });
LikeModel.belongsTo(UserModel, { as: 'user', foreignKey: 'user_id' });

export default LikeModel;
