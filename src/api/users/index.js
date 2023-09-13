import express from "express";
import createHttpError from "http-errors";
import UserModel from "./model.js";
import { Op } from "sequelize";
import ParentModel from "../guardians/model.js";
import { createAccessToken } from "../lib/auth/tools.js";
import { checkUserSchema, triggerBadRequest } from "./validator.js";
import {JWTAuthMiddleware} from "../lib/auth/jwtAuth.js"
import AddressModel from "../address/model.js";
import { sendWhatsAppMessageWithTemplate } from "../makronexusAI/whatsapp/index.js";

const userRouter = express.Router();

userRouter.post("/register",checkUserSchema,triggerBadRequest, async (req, res, next) => {
  const url = process.env.BUSINESS_WHATSAPP_URL;
  const headers = {
    'Authorization': `Bearer ${process.env.BUSINESS_WHATSAPP_BEARER_TOKEN}`, 
    'Content-Type': 'application/json',
  }; 
  try {
    const { email,phone_number,country_code } = req.body; 
    const phone=country_code+phone_number
    console.log("PHONE_NUMBER",phone)
    const userByEmail = await UserModel.findOne({ where: { email } });
    const userByPhone = await UserModel.findOne({ where: { country_code, phone_number } });
    if (userByEmail) {
      res.status(400).send({
        message: "This email has already been registered. Please login.",
      });
    } else if (userByPhone) {
      res.status(400).send({
        message: "This phone number has been registered by another user.",
      });
    } else {
      const new_user = await UserModel.create(req.body);
      if(new_user){
        sendWhatsAppMessageWithTemplate(url,headers,phone,"makronexus_intro","en","")
        const {id } = new_user;
        res.status(201).send({success:true,id} );
      }
    }
  } catch (error) {
    next(error)
  }
});

userRouter.get("/", async (req, res, next) => {
  try {
    const query = {};
    if (req.query.first_name) query.first_name = { [Op.iLike]: `${req.query.first_name}%` };
    const users = await UserModel.findAll({
      where: { ...query },
      attributes: { exclude: ["password","createdAt"], },
      include:[ 
      //   {
      //   model: ParentModel,
      //   attributes: ["first_name", "last_name", "gender", "phone_number"],
      //   through: { attributes: [] },
      // },
      // {
      //   model: AddressModel, 
      //   attributes: ["id", "street", "building_number", "city", "country","province","type_of_settlement","postal_code"], 
      // },
    ]
    });
    res.send(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
    next(error);
  }
});

userRouter.get("/me",JWTAuthMiddleware, async (req, res, next) => {
  try {
    const user = await UserModel.findByPk(req.user.id, {
      attributes: { exclude: ["password","createdAt"] },
      include:[ 
      //   {
      //   model: ParentModel,
      //   attributes: ["first_name", "last_name", "relationship", "phone_number"],
      //   through: { attributes: [] },
      // },
      // {
      //   model: AddressModel, 
      //   attributes: ["id", "street", "building_number", "city", "country","province","type_of_settlement","postal_code","location","apartment_number"], 
      // },
    ],
    });
    if (user) {
      res.send(user);
    } else {
      next(
        createHttpError(404, `User with id ${req.user.id} is not found!`)
      );
    }
  } catch (error) {
    next(error);
  }
});

userRouter.put("/:user_id",JWTAuthMiddleware, async (req, res, next) => {
  try {
    const [numberOfUpdatedRows] = await UserModel.update(
      req.body,
      {
        where: { id: req.params.user_id },
        returning: true,
      }
    );
    if (numberOfUpdatedRows === 1) {
      const updatedRecord = await UserModel.findOne({
        where: { id: req.params.user_id },
        attributes: { exclude: ["password", "createdAt"] }, 
        raw: true, // Retrieve the record as plain JSON data
      });
      delete updatedRecord.password; // Manually delete the "password" attribute
      delete updatedRecord.createdAt; 
      res.send(updatedRecord);
    } else {
      next(
        createHttpError(404, `User with id ${req.params.user_id} is not found!`)
      );
    }
  } catch (error) {
    next(error);
  }
});
userRouter.delete("/me",JWTAuthMiddleware,async (req, res, next) => {
  try {
    const numberOfDeletedRows = await UserModel.destroy({
      where: { id: req.user.id },
    });
    if (numberOfDeletedRows === 1) {
      res.status(204).send();
    } else {
      next(
        createHttpError(404, `User with id ${req.user.id} is not found!`)
      );
    }
  } catch (error) {
    next(error);
  }
});
userRouter.post("/login",async (req,res,next)=>{
 try{
  const {email,password}=req.body;
  const foundUser=await UserModel.findOne({where:{email:email}})
  console.log(foundUser,"FOUND USER")
  if(foundUser){
  const user = await UserModel.checkCredentials(email,password)
  if(user){
  const payload={id:user.id,email:user.email,role:user.role}
      const accessToken=await createAccessToken(payload)
      res.send({accessToken}) 
  }else{
    next(createHttpError(401, "Credentials are wrong!"))
  }
}else{
  next(createHttpError(401,`You do not have an account yet. Please sign up to access the platform`))
}
 }catch(error){
  console.log(error)
  next(error)
 }
})


export default userRouter;