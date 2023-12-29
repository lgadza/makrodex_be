import { DataTypes } from 'sequelize';
import sequelize from '../../../db.js';  // Adjust the path as needed for your project structure
import ProjectModel from '../../projects/model.js';  // Adjust the path to the Project model
import TagModel from '../../tags/model.js';  // Adjust the path to the Tag model

const ProjectTagMappingModel = sequelize.define('project_tag_mapping', {
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
            fields: ['project_id'],
        },
        {
            fields: ['tag_id'],
        }
    ]
});

// Associations
ProjectTagMappingModel.belongsTo(ProjectModel, { as: 'project', foreignKey: 'project_id' });
ProjectTagMappingModel.belongsTo(TagModel, { as: 'tag', foreignKey: 'tag_id' });

export default ProjectTagMappingModel;
