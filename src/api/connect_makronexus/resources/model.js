import { DataTypes } from 'sequelize';
import sequelize from '../../../db.js';  // Adjust the path as needed for your project structure
import UserModel from '../../users/model.js';  // Adjust the path to the User model

const ResourceModel = sequelize.define('resource', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    resource_type: {
        type: DataTypes.STRING,
        allowNull: false  // Possible values: 'Tutorial', 'Ebook', etc.
    },
    upload_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    file_url: {
        type: DataTypes.STRING,
        allowNull: false
    },
    author_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: UserModel,
            key: 'id'
        }
    },
    visibility: {
        type: DataTypes.STRING,
        allowNull: false  // Possible values: 'public', 'private', etc.
    }
}, {
    // Optional settings
    timestamps: true,  // Tracks createdAt and updatedAt automatically
    paranoid: true,    // Enable soft deletes
    // Indexes for performance optimization
    indexes: [
        {
            fields: ['author_id'],
        }
    ]
});

// Associations
ResourceModel.belongsTo(UserModel, { as: 'author', foreignKey: 'author_id' });

export default ResourceModel;
