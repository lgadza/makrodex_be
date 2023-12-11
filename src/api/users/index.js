import express from "express";
import createHttpError from "http-errors";
import UserModel from "./model.js";
import { Op } from "sequelize";
import ParentModel from "../guardians/model.js";
import { createAccessToken } from "../lib/auth/tools.js";
import { checkUserSchema, triggerBadRequest } from "./validator.js";
import {JWTAuthMiddleware} from "../lib/auth/jwtAuth.js"
import AddressModel from "../address/model.js";
import { sendRegistrationEmail } from "../lib/email_tool.js"; 
import { sendWhatsAppMessageWithTemplate } from "../makronexusAI/whatsapp/index.js";
import sgMail from "@sendgrid/mail";

const userRouter = express.Router();


userRouter.post("/register", checkUserSchema, triggerBadRequest, async (req, res, next) => {
  try {
    const { email, phone_number, country_code } = req.body; 
    const phone = country_code + phone_number;

    const userByEmail = await UserModel.findOne({ where: { email } });
    const userByPhone = await UserModel.findOne({ where: { country_code, phone_number } });

    if (userByEmail) {
      return res.status(409).send({
        message: "This email has already been registered. Please login.",
      });
    } else if (userByPhone) {
      return res.status(409).send({
        message: "This phone number has been registered by another user.",
      });
    }

    const newUser = await UserModel.create(req.body);

    // Asynchronous operations
    if (newUser) {
      const { id } = newUser;
      sendWhatsAppMessageWithTemplate(phone, "makronexus_intro").catch(console.error);
      sendRegistrationEmail(email, req.body, id).catch(console.error);

      return res.status(201).send({
        success: true,
        id,
        message: "We've sent a verification link on your email address, please verify the email",
      });
    }
  } catch (error) {
    next(error);
  }
});

userRouter.get("/", async (req, res, next) => {
  try {
    const query = {};
    const minSearchLength = 3;

    if (req.query.first_name && req.query.first_name.length >= minSearchLength) {
      query.first_name = { [Op.like]: `%${req.query.first_name}%` };
    }

    if (req.query.last_name && req.query.last_name.length >= minSearchLength) {
      query.last_name = { [Op.like]: `%${req.query.last_name}%` };
    }

    const users = await UserModel.findAll({
      where: query,
      attributes: { exclude: ["password", "createdAt"] },
      // include relevant models if needed
    });

    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    next(createHttpError(500, "Internal server error"));
  }
});



userRouter.get("/me", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const user = await UserModel.findByPk(req.user.id, {
      attributes: { exclude: ["password", "createdAt"] },
      // include relevant models if needed
    });

    if (!user) {
      return next(createHttpError(404, `User with id ${req.user.id} is not found!`));
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    next(createHttpError(500, "Internal server error"));
  }
});


// userRouter.put("/:user_id", JWTAuthMiddleware, async (req, res, next) => {
//   try {
//     console.log("Updating user with ID:", req.params.user_id); // Add this line for debugging
//     const [numberOfUpdatedRows] = await UserModel.update(
//       req.body,
//       {
//         where: { id: req.params.user_id },
//         returning: true,
//       }
//     );
//     console.log("Number of updated rows:", numberOfUpdatedRows); // Add this line for debugging
//     if (numberOfUpdatedRows === 1) {
//       const updatedRecord = await UserModel.findOne({
//         where: { id: req.params.user_id },
//         attributes: { exclude: ["password", "createdAt"] },
//         raw: true,
//       });
//       console.log("Updated record:", updatedRecord); // Add this line for debugging
//       delete updatedRecord.password;
//       delete updatedRecord.createdAt;
//       res.send(updatedRecord);
//     } else {
//       next(
//         createHttpError(404, `User with id ${req.params.user_id} is not found!`)
//       );
//     }
//   } catch (error) {
//     next(error);
//   }
// });
userRouter.put("/:user_id", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const userId = req.params.user_id;
    const updateData = req.body;

    const [numberOfUpdatedRows, [updatedUser]] = await UserModel.update(updateData, {
      where: { id: userId },
      returning: true,
    });

    if (numberOfUpdatedRows === 0) {
      return next(createHttpError(404, `User with id ${userId} is not found!`));
    }

    const userWithoutSensitiveData = {
      ...updatedUser.get({ plain: true }),
      password: undefined,
      createdAt: undefined
    };

    res.status(200).json(userWithoutSensitiveData);
  } catch (error) {
    console.error(error);
    next(createHttpError(500, "Internal server error"));
  }
});

// userRouter.put("/verifyEmail/:user_id", async (req, res, next) => {
//   try {
//     const user_id = req.params.user_id;
    
//     const updatedUser = await UserModel.update(req.body, {
//       where: { id: user_id },
//       returning: true,
//       plain: true,
//     });

//     if (updatedUser[0] === 0) {
//       return res.status(404).json({ message: 'User not found' });
//     }
//     res.status(200).json({
//       updatedUser: updatedUser[1],
//       message:
//         "Your email is verified, Our team is currently reviewing your request and we will get back to you within the next 24 hours with further information. We kindly ask for your patience while we work on your request. We are committed to providing you with the highest level of service and ensuring that your experience with us is a positive one.",
//     });
//   } catch (error) {
//     next(error);
//   }
// });

userRouter.put("/verifyEmail/:user_id", async (req, res, next) => {
  try {
    const userId = req.params.user_id;
    const updateData = req.body;

    const [numberOfUpdatedRows, [updatedUser]] = await UserModel.update(updateData, {
      where: { id: userId },
      returning: true,
    });

    if (numberOfUpdatedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updatedUserData = {
      ...updatedUser.get({ plain: true }),
      password: undefined,
      createdAt: undefined
    };

    res.status(200).json({
      updatedUser: updatedUserData,
      message: "Your email is verified. Our team is currently reviewing your request. We will get back to you within the next 24 hours with further information."
    });
  } catch (error) {
    console.error(error);
    next(createHttpError(500, "Internal server error"));
  }
});

userRouter.delete("/me", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const numberOfDeletedRows = await UserModel.destroy({
      where: { id: userId },
    });

    if (numberOfDeletedRows === 0) {
      return next(createHttpError(404, `User with id ${userId} is not found!`));
    }

    res.status(204).send(); // 204 No Content
  } catch (error) {
    console.error(error);
    next(createHttpError(500, "Internal server error"));
  }
});

userRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const foundUser = await UserModel.findOne({ where: { email } });

    if (!foundUser) {
      return next(createHttpError(401, `You do not have an account yet. Please sign up to access the platform`));
    }

    const isPasswordValid = await UserModel.checkCredentials(email, password);

    if (!isPasswordValid) {
      return next(createHttpError(401, "Credentials are wrong!"));
    }

    const payload = { id: foundUser.id, email: foundUser.email, role: foundUser.role };
    const accessToken = await createAccessToken(payload);

    res.status(200).json({ accessToken });
  } catch (error) {
    console.error(error);
    next(createHttpError(500, "Internal server error"));
  }
});


export default userRouter;