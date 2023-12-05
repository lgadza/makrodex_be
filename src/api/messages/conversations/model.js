import { DataTypes } from 'sequelize';
import sequelize from '../../db.js';
const ConversationModel = sequelize.define('conversation', {
    conversation_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        autoIncrement: true
    },
    conversation_name: {
        type: DataTypes.STRING,
        // allowNull can be true if you want to allow conversations without explicit names
        allowNull: true
    },
    timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    creator_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    last_message_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'messages', 
            key: 'message_id'
        }
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
}, {
    // Additional model options
});

export default ConversationModel;
