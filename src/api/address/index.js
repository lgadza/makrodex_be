import express from "express"
import AddressModel from "./model.js"
import ApplicantModel from "../applicants/model.js"

const addressRouter=express.Router()

addressRouter.post("/:applicant_id",async(req,res,next)=>{
    try{
const {id}= await AddressModel.create(req.body)
const applicant = await ApplicantModel.findByPk(req.params.applicant_id);
if (!applicant) {
  return res.status(404).send({ error: "Applicant not found" });
}
await applicant.addAddress(id);
res.status(201).send({id})
    }catch(error){
        next(error)
    }
})
addressRouter.get("/applicant_id", async(req,res,next)=>{
    try{
        const addresses=await AddressModel.findAll()
        res.status(200).send({addresses})
    }catch(error){
        next(error)
    }
})
export default addressRouter
