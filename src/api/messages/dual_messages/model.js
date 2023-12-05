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
    }
  
});

export default MessageModel;
