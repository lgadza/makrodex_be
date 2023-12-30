import { DataTypes } from 'sequelize';
import sequelize from '../../../db.js';
import SchoolLevelsModel from '../school_levels/model.js';


const FormsModel = sequelize.define('form', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    level_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: SchoolLevelsModel,
            key: 'id'
        }
    },
    form_name: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    timestamps: true
});

FormsModel.belongsTo(SchoolLevelsModel, { as: 'level', foreignKey: 'level_id' });

export default FormsModel;
