import { DataTypes } from 'sequelize';
import sequelize from '../../../../db.js';
import ProjectModel from '../model.js';

const SolutionModel = sequelize.define('project_solution', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    project_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: ProjectModel,
            key: 'id'
        }
    }
}, {
    // Optional settings
    timestamps: true,
    paranoid: true
});

// Association with ProjectModel
SolutionModel.belongsTo(ProjectModel, { foreignKey: 'project_id' });
ProjectModel.hasMany(SolutionModel, {as: 'solutions', foreignKey: 'project_id' });

export default SolutionModel;
