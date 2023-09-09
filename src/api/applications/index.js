import express from "express"
import UserModel from "./model.js"

const userRouter=express.Router()

userRouter.post("/", async(req,res,next)=>{
    try{
        const {id}=await UserModel.create(req.body)
        res.status(201).send({id})

    }catch(error){
        next(error)
    }
})

userRouter.get("/",async(req,res,next)=>{
    try{
        const users=await UserModel.findAll()
        res.status(200).send({users})
    }catch(error){
        console.log(error)
        next(error)
    }
})
export default userRouter
