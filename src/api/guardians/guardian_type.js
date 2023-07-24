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

guardianTypeRouter.get("/all", async(req,res,next)=>{
   try{
    console.log("Fetching guardian types...");
    const guardian_types=await GuardianTypeModel.findAll()
    res.status(200).send({guardian_types})
   }catch(error){
   console.log(error)
   next(error)
    }
})

guardianTypeRouter.get("/:id", async (req, res, next) => {
    try {
      const { id } = req.params;
      const guardian_type = await GuardianTypeModel.findByPk(id);
      if (!guardian_type) {
        return res.status(404).send({ error: "Guardian type not found" });
      }
      res.status(200).send(guardian_type);
    } catch (error) {
      console.log(error);
      next(error);
    }
  });
  
guardianTypeRouter.put("/:id", async (req, res, next) => {
    try {
      const { id } = req.params;
      const [numberOfUpdatedRows] = await GuardianTypeModel.update(req.body, {
        where: { id },
        returning: true,
      });
      if (numberOfUpdatedRows === 0) {
        return res.status(404).send({ error: "Guardian type not found" });
      }
      res.status(200).send({ message: "Guardian type updated successfully" });
    } catch (error) {
      console.log(error);
      next(error);
    }
  });
  guardianTypeRouter.delete("/:id", async (req, res, next) => {
    try {
      const { id } = req.params;
      const numberOfDeletedRows = await GuardianTypeModel.destroy({
        where: { id },
      });
      if (numberOfDeletedRows === 0) {
        return res.status(404).send({ error: "Guardian type not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.log(error);
      next(error);
    }
  });
  
export default guardianTypeRouter