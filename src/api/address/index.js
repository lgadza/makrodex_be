import express from "express"
import AddressModel from "./model.js"

const addressRouter=express.Router()

addressRouter.post("/",async(req,res,next)=>{
    try{
const {id}= await AddressModel.create(req.body)
res.status(201).send({id})
    }catch(error){
        next(error)
    }
})
addressRouter.get("/", async(req,res,next)=>{
    try{
        const addresses=await AddressModel.findAll()
        res.status(200).send({addresses})
    }catch(error){
        next(error)
    }
})
export default addressRouter
