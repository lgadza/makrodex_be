import { DataTypes } from 'sequelize';
import UserModel from '../../users/model.js';
import sequelize from '../../../db.js';
import ProjectModel from '../projects/model.js';


const CommentModel = sequelize.define('comment', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    project_id: {
        type: DataTypes.UUID,
        allowNull: false,
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
    },
    comment_text: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    likes_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
}, {
    // Optional settings
    timestamps: true,  // If you want to track createdAt and updatedAt
    paranoid: true,    // Enable soft deletes
    // Indexes for performance optimization
    indexes: [
        {
            fields: ['project_id'],
        },
        {
            fields: ['user_id'],
        }
    ]
});

// Associations
CommentModel.belongsTo(ProjectModel, {  foreignKey: 'project_id' });
ProjectModel.hasMany(CommentModel, {as:"comments",  foreignKey: 'project_id' });
CommentModel.belongsTo(UserModel, { as: 'user', foreignKey: 'user_id' });
UserModel.hasMany(CommentModel, { as: 'comments', foreignKey: 'user_id' });



export default CommentModel;
