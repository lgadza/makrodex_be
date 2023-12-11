import sequelize from "../../../db.js";
import qrcode from "qrcode-terminal"
import { Client }from 'whatsapp-web.js';
import { OpenAI } from "openai";
import { makronexaPersonality } from "../../utils/data.js";
import express from "express";
import { ChatOpenAI } from 'langchain/chat_models/openai';
import {ConversationChain} from "langchain/chains"
import { BufferMemory } from 'langchain/memory';
// import { OpenAI } from 'langchain/llms/openai';
import {
  MessagesPlaceholder,
  SystemMessagePromptTemplate,
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
} from 'langchain/prompts';
import UserModel from "../../users/model.js";
import sessionManager from "./sessionManager.js";
import { handleFeatureUsage } from "../ai_usage/index.js";
import { validateReferralCode } from "../../utils/utils.js";
import ReferralModel from "../ai_usage/referral_model.js";


const whatsAppRouter = express.Router();
const token = process.env.WHATSAPP_VERIFY_TOKEN;

// const configuration = new Configuration({
//   organization:process.env.OPENAI_ORGANIZATION_KEY,
//   apiKey: process.env.OPENAI_API_KEY,
// });

const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY,});
// // WHATAPP WEB JS


// const client = new Client();
// client.on('qr', qr => {
//   qrcode.generate(qr, {small: true});
// });
// client.on('ready', () => {
//   console.log('Client is ready!');
// });
// // Listen for incoming messages
// client.on('message', (message) => {
//   // Capture the sender's contact or group ID
//   const senderID = message.from;

//   // Define the automated response message
//   const automatedResponse = "Hello! This is an automated response.";

//   // Send the automated response back to the sender
//   message.reply(automatedResponse)
//     .then((response) => {
//       console.log(`Sent automated response to ${senderID}: ${automatedResponse}`);
//     })
//     .catch((error) => {
//       console.error(`Error sending automated response to ${senderID}: ${error}`);
//     });
// });

// // Start the WhatsApp client
// client.initialize();

// // WHATAPP WEB JS

export async function sendWhatsAppMessageWithTemplate( phone, name) {
  const url = process.env.BUSINESS_WHATSAPP_URL;
  const headers = {
    'Authorization': `Bearer ${process.env.BUSINESS_WHATSAPP_BEARER_TOKEN}`,
    'Content-Type': 'application/json',
  };

  let messagePayload;

  if (name === "makronexus_intro") {
    messagePayload ={
      "messaging_product": "whatsapp",
      "recipient_type": "individual",
      "to": phone,
      "type": "template",
      "template": {
        "name": "makronexus_intro",
        "language": {
          "code": "en"
        },
        "components": [
          {
            "type": "header",
            "parameters": [
              {
                "type": "image",
                "image": {
                  "link": "https://media.licdn.com/dms/image/D4D22AQF1yKSjibQcew/feedshare-shrink_2048_1536/0/1702169359433?e=1704931200&v=beta&t=U3oWfGujsnMfQPe2Lgk1tApttQkm0g0dxCZWsaj4UQ8"
                }
              }
            ]
          }
        ]
      }
    }
    
  } else if (name === "call_to_register") {
    messagePayload = {
      "messaging_product": "whatsapp",
      "recipient_type": "individual",
      "to": phone,
      "type": "template",
      "template": {
        "name": "call_to_register",
        "language": {
          "code": "en_US"
        },
        "components": [
          {
            "type": "header",
            "parameters": [
              {
                "type": "image",
                "image": {
                  "link": "https://media.licdn.com/dms/image/D4D22AQGmKvoLUHk-kg/feedshare-shrink_800/0/1694598891620?e=1697673600&v=beta&t=ejreU3bE7sUT8htftow4d2w8njphSAbmmbIWSUHV1ao"
                }
              }
            ]
          },
          {
            "type": "body",
            "parameters": [
              {
                "type": "text",
                "text": "Friend"
              }
            ]
          }
        ]
      }
    }
  }else if (name === "register_to_makronexus") {
    messagePayload ={
      "messaging_product": "whatsapp",
      "recipient_type": "individual",
      "to": phone,
      "type": "template",
      "template": {
        "name": "register_to_makronexus",
        "language": {
          "code": "en"
        },
        "components": [
          {
            "type": "header",
            "parameters": [
              {
                "type": "image",
                "image": {
                  "link": "https://scontent-waw1-1.xx.fbcdn.net/v/t39.30808-6/409613937_1143001783745777_1368364420575454888_n.jpg?stp=dst-jpg_s960x960&_nc_cat=100&ccb=1-7&_nc_sid=3635dc&_nc_ohc=AEQdAiJttfkAX8J_v03&_nc_ht=scontent-waw1-1.xx&oh=00_AfDC-PWWIhS-1_IxrYGqxbME5RKWooFuXNOYQ_o0i7ZVWQ&oe=657A0AEE"
                }
              }
            ]
          }
        ]
      }
    }
    
  }   

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(messagePayload),
    });
    if (response.ok) {
      const responseData = await response.json();
      console.log("MESSAGES SENT")
      return responseData;
    } else {
      throw new Error('API request failed');
    }
  } catch (error) {
    throw error;
  }
}
async function fetchImagesFromAPI(query) {
  const apiKey = process.env.GOOGLE_IMAGE_SEARCH_KEY;
  const cx = process.env.GOOGLE_IMAGE_SEARCH_ENGINE_ID;
  const safeSearch = 'medium'; // You can adjust the safeSearch parameter as needed

  const baseUrl = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&searchType=image&q=${query}&safe=${safeSearch}`;
  
  try {
    const response = await fetch(baseUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
   
    const images = data.items
      .filter(item => {
        const mimeType = item.mime;
        return mimeType === 'image/png' || mimeType === 'image/jpeg';
      })
      .map(item => ({
        title: item.title,
        link: item.link,
        thumbnail: item.image.thumbnailLink,
        context: item.image.contextLink,
      }));
    
    return images;
  } catch (error) {
    console.error('Error fetching images:', error);
    throw error; 
  }
}


async function sendWhatsAppImage(recipient, URL) {
  const url = process.env.BUSINESS_WHATSAPP_URL;
  const headers = {
    'Authorization': `Bearer ${process.env.BUSINESS_WHATSAPP_BEARER_TOKEN}`,
    'Content-Type': 'application/json',
  };

 

  const messagePayload = {
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": recipient,
    "type": "image",
    "image": {
      "link": URL
    },
  };
  

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(messagePayload),
  });
  console.log("RESPONSE:",response)
  if (response.ok) {

    const responseData = await response.json();
    return responseData;
  } else {
    throw new Error('API request failed');
  }
}
whatsAppRouter.post('/whatsapp/images/file', async (req, res) => {
  const query=req.body.query
  const phone = "+48794144892";
if(phone!=="" && query!==""){
  try {
    const images = await fetchImagesFromAPI(query);
    for (const image of images) {
      await sendWhatsAppImage(phone, image.link);
    }
    res.status(200).json({ message: 'Images sent successfully' });
 

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}else{
  res.status(500).json({ error: 'Internal Server Error' });

}
});

whatsAppRouter.post('/webhooks', async (req, res) => {
  
  try {
  
    const bodyParam = req.body;
    console.log(JSON.stringify(bodyParam, null, 2));

    if (isValidWebhookRequest(bodyParam))
    // if (isValidWebhookRequest(bodyParam) || isImageWebhookRequest(bodyParam))
    
    {
      const messageData = extractMessageData(bodyParam);
      // const imageData=extractImageMessageData(bodyParam)

      // if (messageData || imageData) 
      if (messageData) {
        const {from,text} = messageData;
        // const from = (messageData || imageData).from;
        const phone_number = from.slice(-9);
        console.log(phone_number,"FROM PHONE_NUMBER")
        const country_code = from.slice(0, -9);
        console.log(country_code,"FROM country_code")
        const user = await UserModel.findOne({
          where: {
            phone_number: phone_number,
            country_code: "+" + country_code,
          },
        });
        if (!user) {

          // ! REGISTERING USER THROUGH WHATSAPP
       let userSession = sessionManager.getSession(from);

    // If no session exists, create a new one
    if (!userSession) {
        userSession = sessionManager.createSession(from);
      await  sendWhatsAppMessageWithTemplate(from,"register_to_makronexus")
      await  sendWhatsAppMessage(from, `🌟 Welcome to Makronexus! 🌟`);
      await  sendWhatsAppMessage(from, `To get started with our services, we need a few details from you.`);
      await  sendWhatsAppMessage(from, `Firstly, could you please tell us your first name? e.g John! `);
        return;
    }

    // ?If the session is waiting for the first name
    if (userSession.step === 'awaiting_first_name') {
        const firstName = text.trim(); // Extract and trim the text from the message

        // Check if we are waiting for a confirmation
        if (userSession.awaitingConfirmation) {
            if (firstName.toLowerCase() === 'yes') {
                userSession.awaitingConfirmation = false;
                userSession.step = "awaiting_last_name"; // Move to the next attribute

                // Personalized confirmation message
              await  sendWhatsAppMessage(from, `Awesome, ${userSession.data.first_name}! 🌟  Now, what's your last name? `);
             await   sendWhatsAppMessage(from, `Hopefully, it's easier to spell than 'Schwarzenegger 😄`);
            } else {
                userSession.awaitingConfirmation = false;
                sendWhatsAppMessage(from, "Oops! Let's try your first name again, and make it snappy! 😄");
            }

            res.status(200).send('OK');
            return;
        }

        // Validate the first name (basic validation, adjust regex as needed)
        if (/^[a-zA-Z]{1,15}$/.test(firstName)) {
            userSession.update({ first_name: firstName }, 'awaiting_first_name');
            userSession.awaitingConfirmation = true;

            // Send a message asking for confirmation
           await sendWhatsAppMessage(from, `Got it! Your first name is ${firstName}, right? .`);
            sendWhatsAppMessage(from, `Just reply with 'Yes' or 'No'.`);

            res.status(200).send('OK');
            return;
        } else {
            // Send error message for invalid first name
            sendWhatsAppMessage(from, "Hmm, that doesn't sound like a real first name. 🤔 Try again, and keep it simple this time!");
        }
    }
    // ?If the session is waiting for the last name
    if (userSession.step === 'awaiting_last_name') {
      const lastName = text.trim(); // Extract and trim the text from the message

      // Check if we are waiting for a confirmation
      if (userSession.awaitingConfirmation) {
          if (lastName.toLowerCase() === 'yes') {
              userSession.awaitingConfirmation = false;
              userSession.step = "awaiting_country_code"; // Move to the next attribute

              // Personalized confirmation message
              await sendWhatsAppMessage(from, `Great, So far so good. `);
              sendWhatsAppMessage(from, ` Now we want your country code, e.g +263 or +27 `);
          } else {
              userSession.awaitingConfirmation = false;
              sendWhatsAppMessage(from, "Oops! Let's try your last name again, and make it snappy! 😄");
          }

          res.status(200).send('OK');
          return;
      }

      // Validate the last name (basic validation, adjust regex as needed)
      if (/^[a-zA-Z]{1,15}$/.test(lastName)) {
          userSession.update({ last_name: lastName,email:userSession.data.first_name.toLowerCase()+lastName.toLowerCase()+"@makronexus.com",password:generatePassword(),data_process_acceptance:true }, 'awaiting_last_name');
          userSession.awaitingConfirmation = true;

          // Send a message asking for confirmation
         await sendWhatsAppMessage(from, `Awesome, ${lastName}! You're doing great. `);
         await sendWhatsAppMessage(from, `To confirm just reply with 'Yes' or 'No'. `);

          res.status(200).send('OK');
          return;
      } else {
          // Send error message for invalid last name
         await sendWhatsAppMessage(from, "Hmm, that doesn't sound like a real last name. 🤔 ");
         await sendWhatsAppMessage(from, "Try again, and keep it simple this time! ");
      }
  }
// ?If the session is waiting for the country_code
if (userSession.step === 'awaiting_country_code') {
  const countryCode = text.trim(); // Extract and trim the text from the message

  // Check if we are waiting for a confirmation
  if (userSession.awaitingConfirmation) {
      if (countryCode.toLowerCase() === 'y') {
          userSession.awaitingConfirmation = false;
          userSession.step = "awaiting_date_of_birth"; // Move to the next attribute

          // Personalized confirmation message
       
         await sendWhatsAppMessage(from, ` 🎉 Now, let's talk about your special day! `);
        await   sendWhatsAppMessage(from, ` Could you please share your date of birth with me? `);
         await sendWhatsAppMessage(from, ` Just the format DD-MM-YYYY would be perfect. `);
          sendWhatsAppMessage(from, ` This will help us celebrate you when the time comes! 🎂 `);
      } else {
          userSession.awaitingConfirmation = false;
          sendWhatsAppMessage(from, "Oops Error! Let's try your country code again");
      }

      res.status(200).send('OK');
      return;
  }

  // Validate the last name (basic validation, adjust regex as needed)
  if (/^\+\d{1,3}$/.test(countryCode)) {
      userSession.update({ country_code: countryCode }, 'awaiting_country_code');
      userSession.awaitingConfirmation = true;

      // Send a message asking for confirmation
      let confirmationMessage = "";
      switch (userSession.data.country_code) {
          case '+263':
              confirmationMessage = "Ooh, you're Zimbabwean! Land of the mighty Victoria Falls. 🌍.";
              break;
          case '+27':
              confirmationMessage = "Lovely, you're from South Africa! Home of the breathtaking Table Mountain. 🏞️.";
              break;
          default:
              confirmationMessage = `Thanks! Your country code is ${userSession.data.country_code}.`;
              break;
      }
     await sendWhatsAppMessage(from, confirmationMessage);
      sendWhatsAppMessage(from, "Just reply with 'Y' or 'N'");

      res.status(200).send('OK');
      return;
  } else {
      // Send error message for invalid country code
      await sendWhatsAppMessage(from, "Hmm, that doesn't look quite right. ");
      await sendWhatsAppMessage(from, "Could you please enter your country code e.g +263 or +27");
  }
}
 // ?If the session is waiting for the date of birth
 if (userSession.step === 'awaiting_date_of_birth') {
  const dateOfBirth = text.trim(); // Extract and trim the text from the message

  // Check if we are waiting for a confirmation
  if (userSession.awaitingConfirmation) {
      if (dateOfBirth.toLowerCase() === 'yes') {
          userSession.awaitingConfirmation = false;
          userSession.step = "awaiting_gender"; // Move to the next attribute

          // Personalized confirmation message
        await sendWhatsAppMessage(from, `Awesome, ${userSession.data.first_name}! Now, let's get to know you a bit better. `);
        await sendWhatsAppMessage(from, `Could you kindly share your gender with us? Just type 'male' or 'female'`);
      } else {
          userSession.awaitingConfirmation = false;
          sendWhatsAppMessage(from, "Oops! Let's try your date of birth again,  😄");
      }

      res.status(200).send('OK');
      return;
  }

  // Validate the date of birth (basic validation, adjust regex as needed)
  if (/^\d{2}-\d{2}-\d{4}$/.test(dateOfBirth)) {
      userSession.update({ date_of_birth: dateOfBirth }, 'awaiting_date_of_birth');
      userSession.awaitingConfirmation = true;

      // Send a message asking for confirmation
     await sendWhatsAppMessage(from, `Got it! Your date of birth is ${dateOfBirth}, right? .`);
      sendWhatsAppMessage(from, `To confirm just reply with 'Yes' or 'No'`);

      res.status(200).send('OK');
      return;
  } else {
      // Send error message for invalid date of birth
      sendWhatsAppMessage(from, "Hmm, that doesn't sound like a real date of birth. 🤔 Try again!");
  }
}
 // ?If the session is waiting for the gender
 if (userSession.step === 'awaiting_gender') {
  const gender = text.toLowerCase().trim(); // Extract and trim the text from the message

  // Check if we are waiting for a confirmation
  if (userSession.awaitingConfirmation) {
      if (gender.toLowerCase() === 'y') {
          userSession.awaitingConfirmation = false;
          userSession.step = "awaiting_phone_number"; // Move to the next attribute

          // Personalized confirmation message
         await sendWhatsAppMessage(from, `Great, 📱 Time to connect your phone!  `);
         await sendWhatsAppMessage(from, `Could you please share your phone number with us? Just type it as a 10-digit number, like 0732323236.  `);
          sendWhatsAppMessage(from, `We'll use this number only for essential communication `);
      } else {
          userSession.awaitingConfirmation = false;
          sendWhatsAppMessage(from, "Oops Error! Let's try your gender again, e.g male or female  😄");
      }

      res.status(200).send('OK');
      return;
  }

  // Validate the gender
  if (['male', 'female'].includes(gender)) {
      userSession.update({ gender: gender }, 'awaiting_gender');
      userSession.awaitingConfirmation = true;

      // Send a message asking for confirmation
     await sendWhatsAppMessage(from, `Just to make sure, you are ${gender === 'male' ? 'a gentleman' : 'a lady'}, .`);
      sendWhatsAppMessage(from, `If correct? Type 'Y' or 'N''}, .`);

      res.status(200).send('OK');
      return;
  } else {
      // Send error message for invalid date of birth
      sendWhatsAppMessage(from, "Hmm, gender has to be male or female. 🤔 Try again!");
  }
}
 // ?If the session is waiting for the phone number
 if (userSession.step === 'awaiting_phone_number') {
  const phoneNumber = text.trim(); // Extract and trim the text from the message

  // Check if we are waiting for a confirmation
  if (userSession.awaitingConfirmation) {
      if (phoneNumber.toLowerCase() === 'y') {
          userSession.awaitingConfirmation = false;
          userSession.step = "awaiting_referral_code"; // Move to the next attribute

          await sendWhatsAppMessage(from, `Do you have a referral code? Please enter the 8-character code (for example, "m8rt5xKh") if you do. If you don't have a referral code, simply type 'N'.`);
          res.status(200).send('OK');
          return;

      } else {
          userSession.awaitingConfirmation = false;
          sendWhatsAppMessage(from, "Oops Error! Let's try your phone_number again, e.g male or female  😄");
      }

      res.status(200).send('OK');
      return;
  }

  // Validate the phone_number
  if (/^\d{10}$/.test(phoneNumber)) {
    const modifiedPhoneNumber = phoneNumber.substring(1);
      userSession.update({ phone_number: modifiedPhoneNumber }, 'awaiting_phone_number');
      userSession.awaitingConfirmation = true;

      // Send a message asking for confirmation
     await sendWhatsAppMessage(from, `Just to make sure, your number is 0${phone_number}.`);
      sendWhatsAppMessage(from, `If  correct? Type 'Y' or 'N'.`);

      res.status(200).send('OK');
      return;
  } else {
      // Send error message for invalid date of birth
      sendWhatsAppMessage(from, "That doesn't look like a valid phone number. Please enter it in the format 0788883376. 🤔 Try again!");
  }
}
// ?If the session is waiting for the referral code
if (userSession.step === 'awaiting_referral_code') {
  const referralCode = text.trim(); // Extract and trim the text from the message

  if (referralCode.toLowerCase() !== 'n') {
    try {
      // Validate the referral code
      const isValidReferralCode = await validateReferralCode(referralCode);
      if (isValidReferralCode) {
        userSession.update({ referral_code: referralCode }, 'awaiting_referral_code');
      } else {
        await sendWhatsAppMessage(from, "The referral code you entered is not valid. Please check and try again or type 'N' if you don't have one.");
        return;
      }
    } catch (error) {
      console.error("Error validating referral code:", error);
      await sendWhatsAppMessage(from, "There was an error processing your referral code. Please try again.");
      return;
    }
  }
  userSession.step = "registration_complete"; // Move to the next attribute

  // Call the registerUser function to create the user record with referral code
  registerUser(userSession.data,from).then((newUser) => {
    sendWhatsAppMessage(from,`🎉 Congratulations, ${newUser.first_name}! Your registration is complete. Welcome aboard Makronexus! 🚀`)
     sendWhatsAppMessageWithTemplate(from,"makronexus_intro")
     
 }).catch((error) => {
   if (error.name === 'SequelizeUniqueConstraintError') {
     sendWhatsAppMessage(from, "It seems this email or phone number is already registered. Please try again with different credentials.");
 } else {
     sendWhatsAppMessage(from, "Oops, something went wrong with the registration. Please try again.");
 }
 console.error('Registration Error:', error);
 });

  res.status(200).send('OK');
  return;
}
          console.log("USER NOT FOUND")
          sendWhatsAppMessageWithTemplate("+" + from, "call_to_register")
          
        }else if (!['admin', 'teacher','user', 'student'].includes(user.dataValues.role)) {
          console.log("USER NOT FOUND")
          await sendWhatsAppMessage(from, "You do not currently hold the role of a student, teacher, or admin at one of our partnered schools. If you believe this is in error or have any questions, please feel free to contact us on WhatsApp at +48794144892.");
        res.status(200).json({ message: 'Message sent' });
        }else{
          const lowerCaseMessage = text.trim().toLowerCase();
          console.log("USER:",user.dataValues.id)
          if (lowerCaseMessage.startsWith("image:")) {
            try {
              const images = await fetchImagesFromAPI(lowerCaseMessage);
              for (const image of images) {
                await sendWhatsAppImage(from, image.link);
              }
              res.status(200).json({ message: 'Images sent successfully' });
           
          
            } catch (error) {
              console.error('Error:', error);
              res.status(500).json({ error: 'Internal Server Error' });
            }

          }else if(lowerCaseMessage.startsWith("generate:" || "create:")){
            try{
              if(!["admin","teacher"].includes(user.dataValues.role)){
                await sendWhatsAppMessage(from, " Access to Makronexus image generation is currently restricted. Upgrade to the premium version now for uninterrupted service. For more information, please contact us at +48794144892.");
                res.status(200).json({ message: 'Message sent' });

              }
              // ! GENERATE IMAGE Function
              // else{
              //   const image_url = await generateImage(text);
              //   await sendWhatsAppImage(from,image_url)
              //   res.status(200).json({ message: 'Images sent successfully' });
              // }
            }catch (error) {
              console.error('Error:', error);
              res.status(500).json({ error: 'Internal Server Error' });
            }
          }
        //   else if((imageData)){
        //     const response = await openai.chat.completions.create({
        //       model: "gpt-4-vision-preview",
        //       messages: [
        //         {
        //           role: "user",
        //           content: [
        //             { type: "text", text: imageData.caption },
        //             {
        //               type: "image_url",
        //               image_url: {
        //                 url: imageData.imageFile,
        //               },
        //             },
        //           ],
        //         },
        //       ],
        //     });
        //     console.log("THIS IS THE IMAGE RECIEVED FROM WHATSAPP")
        //     const replyMessage = response.choices[0].message.content;
        // await sendWhatsAppMessage(from, replyMessage);
        // res.status(200).json({ message: 'Message sent' });
        //   }
          
          else{
            // ! Resply from openai
            // Check the conversation limit
            const CONVERSATION_LIMIT = process.env.CONVERSATION_LIMIT;
  const usageStatus = await handleFeatureUsage(user.dataValues.id, 'conversation', CONVERSATION_LIMIT||50);
  if(usageStatus.limitReached){
    sendWhatsAppMessage(from,"Conversation limit reached. Please upgrade to premium or wait until the beginning of next month.")
  }else{
        const response = await openai.chat.completions.create({
          model: "gpt-3.5-turbo", 
          messages:[
            {
              "role":"system","content":`${makronexaPersonality}`
            },
            {
              role:"user",
              content:text,
            }
          ] ,
          max_tokens: 1500,
          temperature: 0.8,
        });
        const replyMessage = response.choices[0].message.content;
        // const replyMessage = `Temporary Service Interruption for Major Upgrades,

        // We are currently upgrading our [service/platform] to serve you better. During this time, you may experience temporary service interruptions. We are working swiftly to complete this upgrade and apologize for any inconvenience caused.
        
        // Thank you for your patience and understanding. We are excited to bring you enhanced features and improved performance very soon!
        
        // Best regards,
        // Makronexus Team`
        await sendWhatsAppMessage(from, replyMessage);
        if(usageStatus.currentUsageCount%10===0){
          await sendWhatsAppMessage(from, `You have used ${usageStatus.currentUsageCount} out of ${CONVERSATION_LIMIT||50} conversations for this month.`);
        }
        res.status(200).json({ message: 'Message sent' });
      }
    }
    }
      } else {
        res.status(400).json({ error: 'Invalid message data' });
      }
    } else {
      res.status(403).json({ error: 'Invalid webhook request' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

function isValidWebhookRequest(body) {
  return (
    body &&
    body.entry &&
    Array.isArray(body.entry) &&
    body.entry.length > 0 &&
    body.entry[0].changes &&
    Array.isArray(body.entry[0].changes) &&
    body.entry[0].changes.length > 0 &&
    body.entry[0].changes[0].value &&
    body.entry[0].changes[0].value.messages &&
    Array.isArray(body.entry[0].changes[0].value.messages) &&
    body.entry[0].changes[0].value.messages.length > 0 &&
    body.entry[0].changes[0].value.messages[0].text &&
    body.entry[0].changes[0].value.messages[0].text.body
  );
}
function isImageWebhookRequest(body) {
  return (
    body &&
    body.entry &&
    Array.isArray(body.entry) &&
    body.entry.length > 0 &&
    body.entry[0].changes &&
    Array.isArray(body.entry[0].changes) &&
    body.entry[0].changes.length > 0 &&
    body.entry[0].changes[0].value &&
    body.entry[0].changes[0].value.messages &&
    Array.isArray(body.entry[0].changes[0].value.messages) &&
    body.entry[0].changes[0].value.messages.length > 0 &&
    body.entry[0].changes[0].value.messages[0].image &&
    body.entry[0].changes[0].value.messages[0].image.file!== undefined
  );
}

function extractMessageData(body) {
  const message = body.entry[0].changes[0].value.messages[0];
  const from = message.from;
  const text = message.text.body;

  return { from, text };
}
// function extractImageMessageData(body) {
//   const message = body.entry[0].changes[0].value.messages[0];
//   const from = message.from;
//   const imageFile = message.image.file;
//   const caption = message.image.caption;

//   return { from, imageFile, caption };
// }

export async function sendWhatsAppMessage(recipient, message) {
  const url = process.env.BUSINESS_WHATSAPP_URL;
  const headers = {
    'Authorization': `Bearer ${process.env.BUSINESS_WHATSAPP_BEARER_TOKEN}`,
    'Content-Type': 'application/json',
  };

  const messagePayload = {
    "messaging_product": "whatsapp",
    "to": "+" + recipient,
    "text": { "body": message },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(messagePayload),
  });

  if (response.ok) {
    const responseData = await response.json();
    return responseData;
  } else {
    throw new Error('API request failed');
  }
}
// ! GENERATE IMAGE Function
// async function generateImage(prompt) {
//   try {
//     const response = await openai.images.generate({
//       model: "dall-e-3",
//       prompt: prompt,
//       n: 1,
//       quality:"standard",
//       size: "1024x1024",
//     });

//     const imageUrl = response.data[0].url;
//     return imageUrl;
//   } catch (error) {
//     console.error("Error generating image:", error);
//     throw error;
//   }
// }

// // Example usage:
// const prompt = "a white siamese cat";
// const image_url = await generateImage(prompt);
// console.log(image_url);

function generatePassword(length = 12) {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
  let password = "";
  for (let i = 0, n = charset.length; i < length; ++i) {
      password += charset.charAt(Math.floor(Math.random() * n));
  }
  return password;
}

// async function registerUser(sessionData,from) {
//   try {
//       const newUser = await UserModel.create(sessionData);

//       if (newUser) {
//           console.log('User successfully registered:', newUser);
//           return newUser;
//       }else{
//         sendWhatsAppMessage(from, "Registration failed. You could not be registered")
//       }
//   } catch (error) {
//       console.error('Error registering user:', error);
//       throw error;
//   }
// }
async function registerUser(sessionData, from) {
  try {
      // Check if a referral code is provided in the session data
      if (sessionData.referral_code) {
          const referral = await ReferralModel.findOne({ where: { code: sessionData.referral_code } });
          const referrer = await UserModel.findOne({ where: { referral_code: sessionData.referral_code } });
          if (!referrer) {
              // Handle the case where the referral code is invalid
              await sendWhatsAppMessage(from, "The referral code is invalid. Proceeding with registration without referral.");
          } else {
              // Create the new user with the referral code
              const newUser = await UserModel.create(sessionData);
              if (newUser) {
                  console.log('User successfully registered:', newUser);

                  // Update the referral entry with the ID of the referred user
                  referral.referred_id = newUser.dataValues.id;
                  referral.referrer_id = referrer.dataValues.id;
                  await referral.save();

                  // Handle any post-registration logic for referrals here (e.g., rewarding the referrer)
                  return newUser;
              } else {
                  await sendWhatsAppMessage(from, "Registration failed. You could not be registered");
              }
          }
      } else {
          // Create the new user without a referral code
          const newUser = await UserModel.create(sessionData);
          if (newUser) {
              console.log('User successfully registered:', newUser);
              return newUser;
          } else {
              await sendWhatsAppMessage(from, "Registration failed. You could not be registered");
          }
      }
  } catch (error) {
      console.error('Error registering user:', error);
      throw error;
  }
}


export default whatsAppRouter;

