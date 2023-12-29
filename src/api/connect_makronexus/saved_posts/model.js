import { DataTypes } from 'sequelize';
import sequelize from '../../../db.js';  // Adjust the path as needed for your project structure
import UserModel from '../../users/model.js';  // Adjust the path to the User model
import PostModel from '../../posts/model.js';  // Adjust the path to the Post model

const SavedPostModel = sequelize.define('saved_post', {
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
    post_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: PostModel,
            key: 'id'
        }
    },
    saved_date: {
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
            fields: ['post_id'],
        }
    ]
});

// Associations
SavedPostModel.belongsTo(UserModel, { as: 'user', foreignKey: 'user_id' });
SavedPostModel.belongsTo(PostModel, { as: 'post', foreignKey: 'post_id' });

export default SavedPostModel;
