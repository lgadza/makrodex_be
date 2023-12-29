import { DataTypes } from 'sequelize';
import sequelize from '../../../db.js';  // Adjust the path as needed for your project structure
import UserModel from '../../users/model.js';  // Adjust the path to the User model
import ProjectModel from '../../projects/model.js';  // Adjust the path to the Project model

// Define enums for status and priority_level
const TaskStatus = {
    NOT_STARTED: 'not started',
    IN_PROGRESS: 'in progress',
    COMPLETED: 'completed',
    // Add more statuses as needed
};

const PriorityLevel = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    // Add more priority levels as needed
};

const TaskModel = sequelize.define('task', {
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
    assigned_to_user_id: {
        type: DataTypes.UUID,
        allowNull: true,  // Allow null if a task is not initially assigned to anyone
        references: {
            model: UserModel,
            key: 'id'
        }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    due_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM(Object.values(TaskStatus)),
        allowNull: false,
        defaultValue: TaskStatus.NOT_STARTED,  // Set a default status if needed
    },
    priority_level: {
        type: DataTypes.ENUM(Object.values(PriorityLevel)),
        allowNull: true,  // Allow null if priority is not set initially
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
            fields: ['assigned_to_user_id'],
        }
    ]
});

// Associations
TaskModel.belongsTo(ProjectModel, { as: 'project', foreignKey: 'project_id' });
TaskModel.belongsTo(UserModel, { as: 'assignedTo', foreignKey: 'assigned_to_user_id' });

export default TaskModel;
