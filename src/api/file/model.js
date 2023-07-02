import { DataTypes } from 'sequelize';
import sequelize from '../db';

const FileUploadModel = sequelize.define('FileUpload', {
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
