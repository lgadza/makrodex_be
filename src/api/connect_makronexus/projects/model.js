import { DataTypes } from 'sequelize';
import sequelize from '../../../db.js'; 
import UserModel from '../../users/model.js'; 
import SchoolModel from '../../schools/model.js';


const ProjectModel = sequelize.define('project', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    background: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    start_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    end_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    owner_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: UserModel,
            key: 'id'
        }
    },
school_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: SchoolModel,
            key: 'id'
        }
    },
    status: {
        type: DataTypes.ENUM,
        values:["ongoing","completed"],
        allowNull: false,
        defaultValue:"ongoing",  
    },
    visibility: {
        type: DataTypes.ENUM,
        values:["public","private","group-specific"],
        allowNull: false,
        defaultValue: "public", 
    }
}, {
    // Optional settings
    timestamps: true,  
    paranoid: true,    
    indexes: [
        {
            fields: ['owner_id'],
        }
    ]
});

// Associations
ProjectModel.belongsTo(UserModel, { as: 'owner', foreignKey: 'owner_id' });

export default ProjectModel;
