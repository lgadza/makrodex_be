import { DataTypes } from 'sequelize';
import sequelize from '../../../db.js';

const SchoolLevelsModel = sequelize.define('school_level', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    level_name: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    timestamps: true
});

export default SchoolLevelsModel;
