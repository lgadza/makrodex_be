import { DataTypes } from 'sequelize';
import sequelize from '../../../db.js';  // Adjust the path as needed for your project structure
import PostModel from '../../posts/model.js';  // Adjust the path to the Post model
import TagModel from '../../tags/model.js';  // Adjust the path to the Tag model

const PostTagMappingModel = sequelize.define('post_tag_mapping', {
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
    tag_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: TagModel,
            key: 'id'
        }
    }
}, {
    // Optional settings
    timestamps: true,  // Tracks createdAt and updatedAt automatically
    paranoid: true,    // Enable soft deletes
    // Indexes for performance optimization
    indexes: [
        {
            fields: ['post_id'],
        },
        {
            fields: ['tag_id'],
        }
    ]
});

// Associations
PostTagMappingModel.belongsTo(PostModel, { as: 'post', foreignKey: 'post_id' });
PostTagMappingModel.belongsTo(TagModel, { as: 'tag', foreignKey: 'tag_id' });

export default PostTagMappingModel;
