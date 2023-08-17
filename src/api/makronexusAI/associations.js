
// import ApplicantModel from "../applicants/model.js";
// import aiChatModel from "./aiChatModel.js";

// import MakronexaQA from "./model.js";


// // Associations
// MakronexaQA.belongsTo(ApplicantModel,{ foreignKey:{allowNull:false,name:"user_id"} });
// MakronexaQA.belongsTo(aiChatModel,{ foreignKey:{allowNull:false,name:"chat_id"} });
// ApplicantModel.hasMany(MakronexaQA, {
//     foreignKey: { allowNull: false, name: "user_id" },  
//   });
// ApplicantModel.hasMany(MakronexaQA, {
//     through: StudentMakronexaQA,
//     foreignKey: { allowNull: false, name: "user_id" },
    
//   });
// ApplicantModel.belongsToMany(aiChatModel, { through: "users_chats" });
// aiChatModel.belongsToMany(ApplicantModel, { through: "users_chats" });

// aiChatModel.hasMany(MakronexaQA,{ foreignKey:{allowNull:false,name:"chat_id"} });
