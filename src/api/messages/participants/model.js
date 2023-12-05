import { DataTypes } from 'sequelize';
import sequelize from '../../../db.js';

const ParticipantModel = sequelize.define('participant', {
    participant_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    conversation_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'conversations', 
            key: 'conversation_id'
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
    join_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    role: {
        type: DataTypes.ENUM("member","moderator","admin"),
        defaultValue: 'member', 
        allowNull: false
    },
});

export default ParticipantModel;
