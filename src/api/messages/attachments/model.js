import { DataTypes } from 'sequelize';
import sequelize from '../../db.js'; // Adjust the path as necessary for your project structure

const AttachmentModel = sequelize.define('attachment', {
    attachment_id: {
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
    file_url: {
        type: DataTypes.STRING,
        allowNull: false
    },
    file_type: {
        type: DataTypes.ENUM("image","video","audio","document","compressed_file","other"),
        allowNull: false
    },
    timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
});

export default AttachmentModel;
