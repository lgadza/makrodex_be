import { DataTypes } from 'sequelize';
import sequelize from '../../../db.js';

const MessageModel = sequelize.define('message', {
    message_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    sender_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
 
    conversation_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'conversations', // This should match the table name for conversations
            key: 'conversation_id'
        }
    },
    receiver_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    read_status: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    // Optional: Soft Delete
    deletedAt: {
        type: DataTypes.DATE
    }
}, {
    // Optional: Enable soft deletes
    paranoid: true,
    // Optional: Indexes for performance optimization
    indexes: [
        {
            fields: ['sender_id']
        },
        {
            fields: ['receiver_id']
        },
        {
            fields: ['timestamp']
        }
    ]
});

// Optional: Model associations
MessageModel.associate = (models) => {
    MessageModel.belongsTo(models.User, { as: 'Sender', foreignKey: 'sender_id' });
    MessageModel.belongsTo(models.User, { as: 'Receiver', foreignKey: 'receiver_id' });
};

export default MessageModel;
