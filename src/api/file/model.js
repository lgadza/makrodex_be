import { DataTypes } from 'sequelize';
import sequelize from '../../db.js';

const FileUploadModel = sequelize.define('fileUpload', {
    file_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    filename: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    url: {
        type: DataTypes.STRING,
        allowNull: false,
      },
  });
  export default FileUploadModel;
