import express from "express"
import ApplicationModel from "./model.js"

const applicationRouter=express.Router()

applicationRouter.post("/", async(req,res,next)=>{
    try{
        const {id}=await ApplicationModel.create(req.body)
        res.status(201).send({id})

    }catch(error){
        next(error)
    }
})

applicationRouter.get("/",async(req,res,next)=>{
    try{
        const applications=await ApplicationModel.findAll()
        res.status(200).send({applications})
    }catch(error){
        console.log(error)
        next(error)
    }
})
export default applicationRouter
