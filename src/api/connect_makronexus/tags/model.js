import { DataTypes } from 'sequelize';
import sequelize from '../../../db.js';  // Adjust the path as needed for your project structure

const TagModel = sequelize.define('tag', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    tag_name: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    // Optional settings
    timestamps: true,  // Tracks createdAt and updatedAt automatically
    indexes: [
        {
            fields: ['tag_name'],
            unique: true
        }
    ]
});

export default TagModel;
