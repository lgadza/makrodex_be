import { DataTypes } from 'sequelize';
import sequelize from '../../../../db.js';
import ProjectModel from '../model.js';

const ProblemModel = sequelize.define('project_problem', {
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
ProblemModel.belongsTo(ProjectModel, { foreignKey: 'project_id' });
ProjectModel.hasMany(ProblemModel, {as:"problems", foreignKey: 'project_id' });
export default ProblemModel;
