import { DataTypes } from 'sequelize';
import sequelize from '../../../../db.js';
import ProjectModel from '../model.js';

const OutcomeModel = sequelize.define('project_outcome', {
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
OutcomeModel.belongsTo(ProjectModel, { foreignKey: 'project_id' });
ProjectModel.hasMany(OutcomeModel, {as: 'outcomes', foreignKey: 'project_id' });

export default OutcomeModel;
