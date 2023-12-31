import { Op } from "sequelize";
import UserFeatureUsageModel from "../makronexusAI/ai_usage/model.js";
import ReferralModel from "../makronexusAI/ai_usage/referral_model.js";
import { sendWhatsAppMessage } from "../makronexusAI/whatsapp/index.js";
import UserModel from "../users/model.js";
import sequelize from "../../db.js";

export async function collectUserDataForRegistration(recipient) {
    let newUser = {};
  
   
    async function askUser(questionText, example) {
      await sendWhatsAppMessage(recipient`${questionText} (Example: ${example})`);
    }

    newUser.first_name = await askUser("What is your first name?", "Louis");
    newUser.last_name = await askUser("What is your last name?", "Armstrong");
    newUser.country_code = await askUser("What is your country code?", "+263");
    newUser.phone_number = await askUser("What is your phone number?", "771234567");
    newUser.gender = await askUser("What is your gender?", "male or female");
    newUser.password = await askUser("Please create a password.", "Password123!");
    newUser.data_process_acceptance = await askUser("Do you accept our data processing terms? Type 'yes' or 'no'.", "yes");
  
    // Convert the response for data_process_acceptance to boolean
    newUser.data_process_acceptance = newUser.data_process_acceptance.toLowerCase() === 'yes';
  
    newUser.date_of_birth = await askUser("Please enter your date of birth.", "01-01-2000");
    newUser.email = await askUser("Do you have an email? Type 'yes' or 'no'.", "yes");
if (newUser.email.toLowerCase() === 'yes') {
  newUser.email = await askUser("What is your email?", "example@mail.com");
} else {
  newUser.email = newUser.first_name+newUser.last_name+"@makronexus.com"
}

if (newUser.email) {
  const userByEmail = await UserModel.findOne({ where: { email: newUser.email } });
  if (userByEmail) {
    res.status(201).send({
      message: "This email has already been registered. Please login.",
    });
    return; 
  }
}
    const new_user = await UserModel.create(newUser);
    if(new_user) {
      const { id } = new_user;
      sendWhatsAppMessageWithTemplate(phone, "makronexus_intro"); 
      await sendRegistrationEmail(newUser.email, newUser, id);
      res.status(201).send({
        success: true,
        id: id,
        message: "We've sent a verification link to your email address, please verify your email."
      });
    }
  
  
  }
  

 export function generateReferralCode(length = 8) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
} 

/**
 * Validates a referral code by checking if it exists in the database.
 * @param {string} code - The referral code to validate.
 * @returns {Promise<boolean>} - True if the code is valid, false otherwise.
 */
export async function validateReferralCode(code) {
  try {
    const referral = await UserModel.findOne({ where: { referral_code:code } });
    return referral !== null;
  } catch (error) {
    console.error("Error in validateReferralCode:", error);
    throw new Error('Error validating referral code');
  }
}
export async function resetReferrerUsageCount(referrerId) {
  const currentDate = new Date();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

  console.log("Referrer ID:", referrerId);
  console.log("First Day of Month:", firstDayOfMonth);

  const transaction = await sequelize.transaction();

  try {
    const [numberOfAffectedRows] = await UserFeatureUsageModel.update(
      {
        current_month_usage_count: 0,
        last_used_at: currentDate
      },
      {
        where: {
          user_id: referrerId,
          // Comment out for debugging
          // last_used_at: {
          //   [Op.lt]: firstDayOfMonth
          // }
        },
        transaction: transaction
      }
    );

    await transaction.commit();
    return numberOfAffectedRows;
  } catch (error) {
    await transaction.rollback();
    console.error("Error in resetReferrerUsageCount:", error);
    throw error;
  }
}

export async function getUserReferralCode(userId) {
  if (!userId) {
    throw new Error("Invalid user ID.");
  }

  const user = await UserModel.findByPk(userId);
  if (!user) {
    throw new Error("User not found.");
  }

  return user.dataValues.referral_code; 
}
