import express from "express"
import GuardianTypeModel from "./guardian_type_model.js"

const guardianTypeRouter=express.Router()

guardianTypeRouter.post("/", async(req,res,next)=>{
   try{
    const {id}=await GuardianTypeModel.create(req.body)
    res.status(201).send({id})
   }catch(error){
   console.log(error)
   next(error)
    }
})
guardianTypeRouter.post("/bulk", async(req,res,next)=>{
   try{
    const types=await GuardianTypeModel.bulkCreate([
        {relationship:"mother"},
        {relationship:"father"},
        {relationship:"grand-father"},
        {relationship:"grand-mother"},
        {relationship:"sister"},
        {relationship:"brother"},
        {relationship:"uncle"},
        {relationship:"aunt"},
        {relationship:"cousin"},
        {relationship:"spouse"},
        {relationship:"guardian"},
    ])
    res.status(201).send(types.map(t=>t.id))
   }catch(error){
   console.log(error)
   next(error)
    }
})
guardianTypeRouter.get("/", async(req,res,next)=>{
   try{
    const guardian_types=await GuardianTypeModel.findAll()
    res.status(201).send({guardian_types})
   }catch(error){
   console.log(error)
   next(error)
    }
})
export default guardianTypeRouter