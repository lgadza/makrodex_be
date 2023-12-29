import { DataTypes } from 'sequelize';
import sequelize from '../../../db.js';  // Adjust the path as needed for your project structure
import PostModel from '../../posts/model.js';  // Adjust the path to the Post model

const FileModel = sequelize.define('post_file', {
    id: {
        type: DataTypes.UUID,
    primaryKey: true,
    defaultValue:DataTypes.UUIDV4
    },
    post_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: PostModel,
            key: 'post_id'
        }
    },
    file_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    file_type: {
        type: DataTypes.STRING,
        allowNull: false
    },
    file_url: {
        type: DataTypes.STRING,
        allowNull: false
    },
    upload_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
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
FileModel.belongsTo(PostModel, { as: 'post', foreignKey: 'post_id' });

export default FileModel;
