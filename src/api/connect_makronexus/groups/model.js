import { DataTypes } from 'sequelize';
import sequelize from '../../../db.js';  
import UserModel from '../../users/model.js';  

const GroupModel = sequelize.define('group', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false
    },
    group_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true 
    },
    creation_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false
    },
    group_owner_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: UserModel,
            key: 'id'
        }
    },
    group_privacy_setting: {
        type: DataTypes.ENUM('private', 'public'), 
        defaultValue: 'public',
        allowNull: false  
    }
}, {
   
    timestamps: true, 

    // Indexes for performance optimization
    indexes: [
        {
            fields: ['group_owner_id'],
        }
    ]
});

// Associations
GroupModel.belongsTo(UserModel, { as: 'groupOwner', foreignKey: 'group_owner_id' });

export default GroupModel;
