import { DataTypes } from 'sequelize';
import PostModel from '../posts/model.js';
import UserModel from '../../users/model.js';
import sequelize from '../../../db.js';


const CommentModel = sequelize.define('comment', {
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
    },
    comment_text: {
        type: DataTypes.TEXT,
        allowNull: false
    },
}, {
    // Optional settings
    timestamps: true,  // If you want to track createdAt and updatedAt
    paranoid: true,    // Enable soft deletes
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
CommentModel.belongsTo(PostModel, { as: 'post', foreignKey: 'post_id' });
CommentModel.belongsTo(UserModel, { as: 'user', foreignKey: 'user_id' });



export default CommentModel;
