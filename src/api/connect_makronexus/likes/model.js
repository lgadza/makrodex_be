import { DataTypes } from 'sequelize';
import sequelize from '../../../db.js';
import PostModel from '../posts/model.js';
import UserModel from '../../users/model.js';
import CommentModel from '../comments/mode.js';
import ProjectModel from '../projects/model.js';

const LikeModel = sequelize.define('like', {
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
    comment_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: CommentModel,
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

LikeModel.belongsTo(PostModel, { as: 'post', foreignKey: 'post_id' });
PostModel.hasMany(LikeModel, {
    foreignKey: 'post_id', 
    as: 'likes', 
});

LikeModel.belongsTo(CommentModel, { as: 'comment', foreignKey: 'comment_id' });
CommentModel.hasMany(LikeModel, {
    foreignKey: 'comment_id', 
    as: 'likes', 
});

LikeModel.belongsTo(ProjectModel, { as: 'project', foreignKey: 'project_id' });
ProjectModel.hasMany(LikeModel, {
    foreignKey: 'project_id', 
    as: 'likes', 
});

LikeModel.belongsTo(UserModel, { as: 'user', foreignKey: 'user_id' });
UserModel.hasMany(LikeModel, {
    foreignKey: 'user_id', 
    as: 'likes', 
});

export default LikeModel;
