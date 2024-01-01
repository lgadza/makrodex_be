import { DataTypes } from 'sequelize';
import sequelize from '../../../db.js';
import PostModel from '../posts/model.js';


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
        allowNull: false 
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
    timestamps: true,  
    paranoid: true,    
    indexes: [
        {
            fields: ['post_id']
        }
    ]
});

// Associations
MediaModel.belongsTo(PostModel, { as: 'post', foreignKey: 'post_id' });
PostModel.hasMany(MediaModel, {
    foreignKey: 'post_id', // Name of the foreign key in the MediaModel
    as: 'media', // Alias for the association
});

export default MediaModel;
