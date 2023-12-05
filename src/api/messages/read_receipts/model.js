import { DataTypes } from 'sequelize';
import sequelize from '../../db.js'; 

const ReadReceiptModel = sequelize.define('readReceipt', {
    receipt_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    message_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'messages', 
            key: 'message_id'
        }
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users', 
            key: 'id'
        }
    },
    read_timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
});

export default ReadReceiptModel;
