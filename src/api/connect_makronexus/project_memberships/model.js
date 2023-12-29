import { DataTypes } from 'sequelize';
import sequelize from '../../../db.js';  // Adjust the path as needed for your project structure
import UserModel from '../../users/model.js';  // Adjust the path to the User model
import ProjectModel from '../../projects/model.js';  // Adjust the path to the Project model

const ProjectMembershipModel = sequelize.define('projectMembership', {
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
    role_in_project: {
        type: DataTypes.STRING,
        allowNull: false  // Possible values: 'Leader', 'Collaborator', etc.
    },
    join_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    last_activity_date: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    // Optional settings
    timestamps: true,  // Tracks createdAt and updatedAt automatically
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
ProjectMembershipModel.belongsTo(ProjectModel, { as: 'project', foreignKey: 'project_id' });
ProjectMembershipModel.belongsTo(UserModel, { as: 'user', foreignKey: 'user_id' });

export default ProjectMembershipModel;
