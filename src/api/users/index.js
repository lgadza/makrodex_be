import express from "express";
import createHttpError from "http-errors";
import UserModel from "./model.js";
import { Op } from "sequelize";
import ParentModel from "../guardians/model.js";
import { createAccessToken } from "../lib/auth/tools.js";
import { checkUserSchema, triggerBadRequest } from "./validator.js";
import {JWTAuthMiddleware} from "../lib/auth/jwtAuth.js"
import AddressModel from "../address/model.js";
import { sendRegistrationEmail } from "../../lib/email-tools.js";
import { sendWhatsAppMessageWithTemplate } from "../makronexusAI/whatsapp/index.js";
import sgMail from "@sendgrid/mail";

const userRouter = express.Router();

userRouter.post("/register",checkUserSchema,triggerBadRequest, async (req, res, next) => {
  try {
    const { email,phone_number,country_code } = req.body; 
    const phone=country_code+phone_number
    console.log("PHONE_NUMBER",phone)
    const userByEmail = await UserModel.findOne({ where: { email } });
    const userByPhone = await UserModel.findOne({ where: { country_code, phone_number } });
    if (userByEmail) {
      res.status(201).send({
        message: "This email has already been registered. Please login.",
      });
    } else if (userByPhone) {
      res.status(201).send({
        message: "This phone number has been registered by another user.",
      });
    } else {
      const new_user = await UserModel.create(req.body);
      if(new_user){
        const {id } = new_user;
        sendWhatsAppMessageWithTemplate(phone,"makronexus_intro")
        await sendRegistrationEmail(email,req.body,id)
        res.status(201).send({success:true,id,message:
          "  We've sent a verification link on your email address, please verify the email",} );
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

userRouter.put("/:user_id", JWTAuthMiddleware, async (req, res, next) => {
  try {
    console.log("Updating user with ID:", req.params.user_id); // Add this line for debugging
    const [numberOfUpdatedRows] = await UserModel.update(
      req.body,
      {
        where: { id: req.params.user_id },
        returning: true,
      }
    );
    console.log("Number of updated rows:", numberOfUpdatedRows); // Add this line for debugging
    if (numberOfUpdatedRows === 1) {
      const updatedRecord = await UserModel.findOne({
        where: { id: req.params.user_id },
        attributes: { exclude: ["password", "createdAt"] },
        raw: true,
      });
      console.log("Updated record:", updatedRecord); // Add this line for debugging
      delete updatedRecord.password;
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
userRouter.put("/verifyEmail/:user_id", async (req, res, next) => {
  try {
    const user_id = req.params.user_id;
    
    const updatedUser = await UserModel.update(req.body, {
      where: { id: user_id },
      returning: true,
      plain: true,
    });

    if (updatedUser[0] === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({
      updatedUser: updatedUser[1],
      message:
        "Your email is verified, Our team is currently reviewing your request and we will get back to you within the next 24 hours with further information. We kindly ask for your patience while we work on your request. We are committed to providing you with the highest level of service and ensuring that your experience with us is a positive one.",
    });
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