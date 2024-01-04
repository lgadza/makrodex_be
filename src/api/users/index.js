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
import { generateReferralCode, resetReferrerUsageCount } from "../utils/utils.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import sequelize from "../../db.js";

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
    // Generate a unique referral code for the new user
    let referral_code;
    let isUnique = false;
    while (!isUnique) {
      referral_code = generateReferralCode();
      const existingUser = await UserModel.findOne({ where: { referral_code } });
      if (!existingUser) {
        isUnique = true;
      }
    }

    // Include the referral code in the user creation
    const newUser = await UserModel.create({ ...req.body, referral_code });

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


// Endpoint to fetch users with dynamic query, sorting, and pagination
userRouter.get("/", asyncHandler(async (req, res, next) => {
  try {
      const minSearchLength = 3;
      let whereClause = {};
      const searchFields = ['first_name', 'last_name', 'email', 'country_code', 'citizenship'];
      searchFields.forEach(field => {
          if (req.query[field] && req.query[field].length >= minSearchLength) {
              whereClause[field] = { [Op.iLike]: `%${req.query[field]}%` };
          }
      });
if (req.query.gender) {
  whereClause.gender = sequelize.literal(`"gender"::text ILIKE '%${req.query.gender}%'`);
}
if (req.query.role) {
  whereClause.role = sequelize.literal(`"role"::text ILIKE '%${req.query.role}%'`);
}

      // Pagination parameters
      const limit = req.query.limit ? parseInt(req.query.limit) : 10;
      const page = req.query.page ? parseInt(req.query.page) : 1;
      const offset = (page - 1) * limit;

      // Sorting parameters
      const sortField = req.query.sortField || 'createdAt'; // Default sort field
      const sortOrder = req.query.sortOrder === 'desc' ? 'DESC' : 'ASC'; // Default sort order

      // Fetch users with count for pagination
      const { count: totalUsers, rows: users } = await UserModel.findAndCountAll({
          where: whereClause,
          attributes: { exclude: ["password"] }, // Exclude sensitive data
          limit,
          offset,
          order: [[sortField, sortOrder]],
      });

      // Calculate total number of pages
      const totalPages = Math.ceil(totalUsers / limit);

      res.status(200).json({
          totalUsers,
          totalPages,
          currentPage: page,
          usersPerPage: limit,
          users,
      });
  } catch (error) {
      console.error(error);
      next(createHttpError(500, "Internal server error"));
  }
}));



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

userRouter.post('/generate-referral-codes', async (req, res) => {
  try {
    await assignReferralCodesToExistingUsers();
    res.status(200).send('Referral codes generated successfully.');
  } catch (error) {
    console.error('Error generating referral codes:', error);
    res.status(500).send('Internal Server Error');
  }
});

async function assignReferralCodesToExistingUsers() {
  const users = await UserModel.findAll({ where: { referral_code: null } });

  for (const user of users) {
    let referral_code;
    let isUnique = false;

    while (!isUnique) {
      referral_code = generateReferralCode();
      const existingUser = await UserModel.findOne({ where: { referral_code } });
      if (!existingUser) {
        isUnique = true;
      }
    }

    user.referral_code = referral_code;
    await user.save();
  }
}


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
userRouter.post('/reset-usage/:referrerId', async (req, res) => {
  try {
    const referrerId = req.params.referrerId;
    const numberOfAffectedRows = await resetReferrerUsageCount(referrerId);
  
    if (numberOfAffectedRows === 0) {
      return res.status(404).json({ message: 'No records found to update or already updated.' });
    }
  
    res.status(200).json({ message: 'Current usage count reset successfully.' });
  } catch (error) {
    console.error('Error resetting usage count:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
  
});

export default userRouter;