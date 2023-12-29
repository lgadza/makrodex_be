import { DataTypes } from 'sequelize';
import sequelize from '../../../db.js';  
import UserModel from '../../users/model.js'; 
import TagModel from '../../tags/model.js';  

const UserInterestTagModel = sequelize.define('user_interest_tag', {
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
    tag_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: TagModel,
            key: 'id'
        }
    }
}, {
    // Optional settings
    timestamps: true,  
    paranoid: true, 
    // Indexes for performance optimization
    indexes: [
        {
            fields: ['user_id'],
        },
        {
            fields: ['tag_id'],
        }
    ]
});

// Associations
UserInterestTagModel.belongsTo(UserModel, { as: 'user', foreignKey: 'user_id' });
UserInterestTagModel.belongsTo(TagModel, { as: 'tag', foreignKey: 'tag_id' });

export default UserInterestTagModel;
