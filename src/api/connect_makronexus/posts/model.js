import { DataTypes } from 'sequelize';
import sequelize from '../../../db.js'; 
import UserModel from '../../users/model.js';  

const PostModel = sequelize.define('post', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue:DataTypes.UUIDV4
    },
    user_id: {
        type: DataTypes.UUID, 
        allowNull: false,
        references: {
            model: UserModel,
            key: 'id'
        }
    },
    title: {
        type: DataTypes.STRING,
        allowNull: true
    },
    content_text: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    visibility: {
        type: DataTypes.ENUM,
        values: ['public', 'friends', 'private', 'custom'],
        defaultValue:"public"
    },
    status: {
        type: DataTypes.ENUM,
        values: ['active', 'deleted', 'archived'],
        defaultValue:"active"
    },
    likes_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    comments_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    shares_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    parent_post_id: {
        type: DataTypes.UUID,
        allowNull: true
    },
    location: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    // Optional settings
    timestamps: true,  
    paranoid: true,    
    // Indexes for performance optimization
    indexes: [
        {
            fields: ['user_id']
        }
    ]
});

// Associations
PostModel.belongsTo(UserModel, { as: 'user', foreignKey: 'user_id' });

export default PostModel;
