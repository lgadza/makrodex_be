import { DataTypes } from 'sequelize';
import sequelize from '../../../db.js';
import MessageModel from './MessageModel'; // update with correct import path

const ReactionModel = sequelize.define('reaction', {
    reaction_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    message_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'message',
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
    type: {
        type: DataTypes.STRING,
        allowNull: false
    },
    timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    // other model options...
});

// Relationship with MessageModel
ReactionModel.belongsTo(MessageModel, { foreignKey: 'message_id' });
MessageModel.hasMany(ReactionModel, { foreignKey: 'message_id' });

export default ReactionModel;
