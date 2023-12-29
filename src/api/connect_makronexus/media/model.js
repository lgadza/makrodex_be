import { DataTypes } from 'sequelize';
import sequelize from '../../../db.js';  // Adjust the path as needed for your project structure
import PostModel from '../../posts/model.js';  // Adjust the path to the Post model

const MediaModel = sequelize.define('media', {
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
    media_url: {
        type: DataTypes.STRING,
        allowNull: false
    },
    media_type: {
        type: DataTypes.STRING,
        allowNull: false  // 'image' or 'video'
    },
    upload_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    thumbnail_url: {
        type: DataTypes.STRING,
        allowNull: true  // Only for videos
    }
}, {
    // Optional settings
    timestamps: true,  // If you want to track createdAt and updatedAt
    paranoid: true,    // Enable soft deletes
    // Indexes for performance optimization
    indexes: [
        {
            fields: ['post_id']
        }
    ]
});

// Associations
MediaModel.belongsTo(PostModel, { as: 'post', foreignKey: 'post_id' });

export default MediaModel;
