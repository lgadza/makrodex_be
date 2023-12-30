import { DataTypes } from 'sequelize';
import sequelize from '../../../db.js';
import FormsModel from '../forms/model.js';
import SubjectsModel from '../subjects/model.js';


const SubjectLevelsModel = sequelize.define('subject_level', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    form_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: FormsModel,
            key: 'id'
        }
    },
    subject_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: SubjectsModel,
            key: 'id'
        }
    }
}, {
    timestamps: true
});

SubjectLevelsModel.belongsTo(FormsModel, { as: 'form', foreignKey: 'form_id' });
SubjectLevelsModel.belongsTo(SubjectsModel, { as: 'subject', foreignKey: 'subject_id' });

export default SubjectLevelsModel;
