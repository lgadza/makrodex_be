import { DataTypes } from 'sequelize';
import sequelize from '../../../db.js';  // Adjust the path as needed for your project structure
import UserModel from '../../users/model.js';  // Adjust the path to the User model

const SimilarMindModel = sequelize.define('similar_mind', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: UserModel,
            key: 'id'
        }
    },
    similar_user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: UserModel,
            key: 'id'
        }
    },
    similarity_score: {
        type: DataTypes.FLOAT,
        allowNull: false
    }
}, {
    // Optional settings
    timestamps: true,  // Tracks createdAt and updatedAt automatically
    paranoid: true,    // Enable soft deletes
    // Indexes for performance optimization
    indexes: [
        {
            fields: ['user_id'],
        },
        {
            fields: ['similar_user_id'],
        }
    ]
});

// Associations
SimilarMindModel.belongsTo(UserModel, { as: 'user', foreignKey: 'user_id' });
SimilarMindModel.belongsTo(UserModel, { as: 'similarUser', foreignKey: 'similar_user_id' });

export default SimilarMindModel;
