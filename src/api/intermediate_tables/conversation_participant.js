import ConversationModel from "../messages/conversations/model";
import UserModel from "../users/model";

const ConversationParticipant = sequelize.define('conversation_participant', {
    user_id: {
        type: DataTypes.UUID,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    conversation_id: {
        type: DataTypes.UUID,
        references: {
            model: 'conversations',
            key: 'conversation_id'
        }
    }
});

// Then, define the associations
UserModel.belongsToMany(ConversationModel, { through: ConversationParticipant });
ConversationModel.belongsToMany(User, { through: ConversationParticipant });
