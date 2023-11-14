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
                  "link": "https://media.licdn.com/dms/image/D4D22AQGmKvoLUHk-kg/feedshare-shrink_800/0/1694598891620?e=1697673600&v=beta&t=ejreU3bE7sUT8htftow4d2w8njphSAbmmbIWSUHV1ao"
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
          console.log("USER NOT FOUND")
          sendWhatsAppMessageWithTemplate("+" + from, "call_to_register")
        }else if (!['admin', 'teacher','user', 'student'].includes(user.dataValues.role)) {
          console.log("USER NOT FOUND")
          await sendWhatsAppMessage(from, "You do not currently hold the role of a student, teacher, or admin at one of our partnered schools. If you believe this is in error or have any questions, please feel free to contact us on WhatsApp at +48794144892.");
        res.status(200).json({ message: 'Message sent' });
        }else{
          const lowerCaseMessage = text.trim().toLowerCase();
          console.log("USER:",user)
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
              if(!["admin","teacher"]){
                await sendWhatsAppMessage(from, " Access to Makronexus image generation is currently restricted. Upgrade to the premium version now for uninterrupted service. For further assistance, please contact us at +48794144892.");
                res.status(200).json({ message: 'Message sent' });

              }else{
                const image_url = await generateImage(text);
                await sendWhatsAppImage(from,image_url)
                res.status(200).json({ message: 'Images sent successfully' });
              }
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
        await sendWhatsAppMessage(from, replyMessage);
        res.status(200).json({ message: 'Message sent' });
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

async function sendWhatsAppMessage(recipient, message) {
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
async function generateImage(prompt) {
  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      quality:"standard",
      size: "1024x1024",
    });

    const imageUrl = response.data[0].url;
    return imageUrl;
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
}

// Example usage:
const prompt = "a white siamese cat";
const image_url = await generateImage(prompt);
console.log(image_url);

export default whatsAppRouter;

