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
        allowNull: false
    },
    category_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: CategoriesModel,
            key: 'id'
        }
    }
}, {
    timestamps: true
});

SubjectsModel.belongsTo(CategoriesModel, { as: 'category', foreignKey: 'category_id' });

export default SubjectsModel;
