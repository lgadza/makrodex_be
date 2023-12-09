import { DataTypes } from 'sequelize';
import sequelize from '../../../db.js';
import ParticipantModel from '../participants/model.js';
import UserModel from '../../users/model.js';
import MessageModel from '../dual_messages/model.js';

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
    last_message_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'messages', 
            key: 'message_id'
        }
    },
    // Optional: Auditing fields
    creator_id: {
        type: DataTypes.UUID,
        allowNull: false,
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
// ConversationModel.associate = (models) => {
//     ConversationModel.belongsTo(models.User, { as: 'creator', foreignKey: 'creator_id' });
//     ConversationModel.belongsTo(models.Message, { as: 'lastMessage', foreignKey: 'last_message_id' });
// };
ConversationModel.hasMany(ParticipantModel, { as: 'participants', foreignKey: 'conversation_id' });
ParticipantModel.belongsTo(UserModel, { as: 'user', foreignKey: 'user_id' });
ConversationModel.belongsTo(MessageModel, { as: 'lastMessage', foreignKey: 'last_message_id' });



export default ConversationModel;
