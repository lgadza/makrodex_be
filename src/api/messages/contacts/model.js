import { DataTypes } from 'sequelize';
import sequelize from '../../db.js';

const ContactModel = sequelize.define('contact', {
    contact_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users', 
            key: 'id'
        }
    },
    contact_user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users', 
            key: 'id'
        }
    },
    nickname: {
        type: DataTypes.STRING,
        allowNull: true // Set to false if you require a nickname for all contacts
    },
    
});

export default ContactModel;
