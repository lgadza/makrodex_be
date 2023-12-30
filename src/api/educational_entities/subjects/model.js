import { DataTypes } from 'sequelize';
import sequelize from '../../../db.js';
import CategoriesModel from '../categories/model.js';

const SubjectsModel = sequelize.define('subject', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    subject_name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
}, {
    timestamps: true
});

// Many-to-Many Relationship
const SubjectCategory = sequelize.define('subject_category', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    subject_id: {
        type: DataTypes.UUID,
        references: {
            model: SubjectsModel,
            key: 'id'
        }
    },
    category_id: {
        type: DataTypes.UUID,
        references: {
            model: CategoriesModel,
            key: 'id'
        }
    }
}, {
    timestamps: true
});

SubjectsModel.belongsToMany(CategoriesModel, { through: SubjectCategory, foreignKey: 'subject_id' });
CategoriesModel.belongsToMany(SubjectsModel, { through: SubjectCategory, foreignKey: 'category_id' });

export default SubjectsModel;
