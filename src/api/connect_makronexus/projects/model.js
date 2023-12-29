import { DataTypes } from 'sequelize';
import sequelize from '../../../db.js';  // Adjust the path as needed for your project structure
import UserModel from '../../users/model.js';  // Adjust the path to the User model
const ProjectStatus = {
    ONGOING: 'ongoing',
    COMPLETED: 'completed',
    // Add more statuses as needed
};

const VisibilityOptions = {
    PUBLIC: 'public',
    PRIVATE: 'private',
    GROUP_SPECIFIC: 'group-specific',
    // Add more visibility options as needed
};
const ProjectModel = sequelize.define('project', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    project_title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    start_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    end_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    project_owner_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: UserModel,
            key: 'id'
        }
    },
    project_status: {
        type: DataTypes.ENUM(Object.values(ProjectStatus)),
        allowNull: false,
        defaultValue: ProjectStatus.ONGOING,  // Set a default status if needed
    },
    visibility: {
        type: DataTypes.ENUM(Object.values(VisibilityOptions)),
        allowNull: false,
        defaultValue: VisibilityOptions.PUBLIC,  // Set a default visibility if needed
    }
}, {
    // Optional settings
    timestamps: true,  // Tracks createdAt and updatedAt automatically
    paranoid: true,    // Enable soft deletes
    // Indexes for performance optimization
    indexes: [
        {
            fields: ['project_owner_id'],
        }
    ]
});

// Associations
ProjectModel.belongsTo(UserModel, { as: 'projectOwner', foreignKey: 'project_owner_id' });

export default ProjectModel;
