import { DataTypes } from 'sequelize';
import sequelize from '../../db.js';

const ConversationModel = sequelize.define('conversation', {
    conversation_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    conversation_name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    last_message_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'messages', 
            key: 'message_id'
        }
    },
    // Optional: Auditing fields
    created_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    updated_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    // Optional: Soft Delete
    deletedAt: {
        type: DataTypes.DATE
    }
}, {
    // Enable soft deletes
    paranoid: true,
    // Enable automatic handling of created_at and updated_at
    timestamps: true,
    // Indexes for performance optimization
    indexes: [
        {
            fields: ['creator_id']
        },
        {
            fields: ['last_message_id']
        }
    ]
});

// Optional: Model associations
ConversationModel.associate = (models) => {
    ConversationModel.belongsTo(models.User, { as: 'Creator', foreignKey: 'creator_id' });
    ConversationModel.belongsTo(models.Message, { as: 'LastMessage', foreignKey: 'last_message_id' });
};

export default ConversationModel;
