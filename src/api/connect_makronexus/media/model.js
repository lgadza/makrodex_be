import { DataTypes } from 'sequelize';
import sequelize from '../../../db.js';
import PostModel from '../posts/model.js';
import ProjectModel from '../projects/model.js';


const MediaModel = sequelize.define('media', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    post_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: PostModel,
            key: 'id'
        }
    },
    project_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: ProjectModel,
            key: 'id'
        }
    },
    media_url: {
        type: DataTypes.STRING,
        allowNull: false
    },
    media_type: {
        type: DataTypes.STRING,
        allowNull: false 
    },
    upload_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    thumbnail_url: {
        type: DataTypes.STRING,
        allowNull: true  
    }
}, {
    // Optional settings
    timestamps: true,  
    paranoid: true,    
    indexes: [
        {
            fields: ['post_id']
        },
        {
            fields: ['project_id']
        }
    ]
});

// Associations
MediaModel.belongsTo(PostModel, { as: 'post', foreignKey: 'post_id' });
PostModel.hasMany(MediaModel, {
    foreignKey: 'post_id', 
    as: 'media', 
});
MediaModel.belongsTo(ProjectModel, { as: 'project', foreignKey: 'project_id' });
ProjectModel.hasMany(MediaModel, {
    foreignKey: 'project_id', 
    as: 'media', 
});

export default MediaModel;
