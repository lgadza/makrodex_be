
import express from 'express';
import {DirectoryLoader} from "langchain/document_loaders/fs/directory"
import { OpenAI } from 'langchain/llms/openai';
import { RetrievalQAChain, loadQAStuffChain } from 'langchain/chains';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { FaissStore } from 'langchain/vectorstores/faiss';
import { QdrantVectorStore } from 'langchain/vectorstores/qdrant';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { CharacterTextSplitter } from 'langchain/text_splitter';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { CSVLoader } from 'langchain/document_loaders/fs/csv';
import { DocxLoader } from 'langchain/document_loaders/fs/docx';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import {ConversationChain} from"langchain/chains"
import {
  MessagesPlaceholder,
  SystemMessagePromptTemplate,
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
} from 'langchain/prompts';
import { BufferMemory } from 'langchain/memory';
import {QdrantClient} from '@qdrant/js-client-rest';
import multer from 'multer';
import { Tiktoken } from '@dqbd/tiktoken/lite';
import { load } from '@dqbd/tiktoken/load';
import  registry  from '@dqbd/tiktoken/registry.json' assert{type:"json"};
import  models  from '@dqbd/tiktoken/model_to_encoding.json' assert{type:"json"};
import { type } from 'os';
import FileModel from "../files/model.js"
import { JWTAuthMiddleware } from '../../lib/auth/jwtAuth.js';
import UserAISettingsModel from '../userAISettings/model.js';
import UserModel from '../../users/model.js';
import aiChatModel from '../chats/model.js';
import MakronexaQA from '../model.js';
// import {PointStruct} from '@qdrant'


function getFilePath(filename) {
  const routerDirectory = path.dirname(fileURLToPath(import.meta.url));
  const fullPath = path.join(routerDirectory, filename);
  return fullPath;
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Set the destination folder for temporary file storage
    const uploadFolder = getFilePath('../../../../uploads'); ; // Calculate the absolute path
    cb(null, uploadFolder);
  },
  filename: (req, file, cb) => {
    // Set the filename of the uploaded file (you can customize this)
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });
const router = express.Router();

router.post('/:user_id/:userAISettings_id/files/save',upload.single('file'), async (req, res) => {

  let collectionName="Makronexus_EduCenter"

  try {

    const fileDataAsString = req.file;
    const fileExtension = path.extname(fileDataAsString.originalname);
  // SAVA FILE
  const { originalname, mimetype, size }=fileDataAsString
  const { user_id,userAISettings_id } = req.params;
  const user = await UserModel.findByPk(user_id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  const DataBase = await UserAISettingsModel.findOne({
    where: { id: userAISettings_id, user_id: user.id },
  });
  if (!DataBase) {
    return res.status(404).json({ message: "Database not found" });
  }
  const dataSetJson = DataBase.toJSON();
  const collectionName = dataSetJson.dataset_name;
     const file = await FileModel.create({
       type: mimetype,
       name: originalname,
       size,
       userAISettings_id,
     });
     // SAVA FILE
       if(fileExtension==='.pdf'){
         const filePath = fileDataAsString.path;
         const loader= new DirectoryLoader(getFilePath('../../../../uploads'),{
         ".pdf": (path)=> new  PDFLoader(path),
         ".csv": (path)=> new  CSVLoader(path),
         ".txt": (path)=> new  TextLoader(path),
         // ".docx": (path)=> new  DocxLoader(path),
         })
    
       const docs = await loader.load();
      //  console.log(docs,"DOCUMENTS")
   const calculateCost=async()=>{
     const modelName="gpt-3.5-turbo";
     const modelKey=models[modelName];
     const model=await load(registry[modelKey])
     const encoder=new Tiktoken(
       model.bpe_ranks,
       model.special_tokens,
       model.pat_str
     );
     const tokens=encoder.encode(JSON.stringify(docs));
     const tokenCount=tokens.length;
     const ratePerThousandTokens=0.002
     const cost=(tokenCount/1000)*ratePerThousandTokens;
     encoder.free();
     return cost
   }
   const splitter = new CharacterTextSplitter({
         chuckSize: 1000,
         chunkOverlap: 20,
       });
       const documents = await splitter.splitDocuments(docs);
           const embeddings = new OpenAIEmbeddings();
       const vectorstore = await QdrantVectorStore.fromDocuments(documents, embeddings,
         {
           url: process.env.QDRANT_URL,
            collectionName: collectionName,
            apiKey:process.env.QDRANT_DB_KEY
         });
         console.log(vectorstore,"VECTORSTORE")
       if (vectorstore) {
         try {
          //  fs.unlinkSync(filePath);
           // Delete all files in the "uploads" folder
          const uploadFolderPath = getFilePath('../../../../uploads');
          fs.readdirSync(uploadFolderPath).forEach((file) => {
            const filePath = path.join(uploadFolderPath, file);
            fs.unlinkSync(filePath);
          });
           res.status(201).json({ message: 'File saved successfully',file:file });
          } catch (error) {
            console.error('Error deleting file:', error);
          }
        }
       
       }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while saving the file' });
  }
});

router.post('/:user_id/:dataset_id/chats/:chat_id/query', async (req, res) => {
  // const collectionName = "My Cover letter";
  const { question,collectionName } = req.body;
  const { message,chat_id, dataset_id, user_id } = req.params;

  try {
    // Fetch user, chat, and dataset in parallel
    const [user, chat, dataset] = await Promise.all([
      UserModel.findByPk(user_id),
      aiChatModel.findByPk(chat_id),
      dataset_id ? UserAISettingsModel.findByPk(dataset_id) : null, // Only fetch if dataset_id is provided
    ]);

    // Check for missing user or chat
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    const embeddings = new OpenAIEmbeddings();
    const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
      url: process.env.QDRANT_URL,
      collectionName: collectionName,
      apiKey: process.env.QDRANT_DB_KEY,
    });

    const model = new OpenAI({ temperature: 0, model: "gpt-3.5-turbo" });
    const chain = new RetrievalQAChain({
      combineDocumentsChain: loadQAStuffChain(model),
      retriever: vectorStore.asRetriever(),
      returnSourceDocuments: true,
    });

    const result = await chain.call({
      query: question,
    });

    // Create a new MakronexaQA instance for the user's input
    const newMakronexaQA = await MakronexaQA.create({
      type: "text",
      message: question,
      from: "user",
      model: "gpt-3.5-turbo",
      user_id: user_id,
      chat_id: chat_id,
      dataset_id: dataset_id,
    });

    // If dataset_id is not null and dataset is found, associate it with the newMakronexaQA
    if (dataset_id && dataset) {
      await newMakronexaQA.setUserAISettingsModel(dataset);
    }

    // Associate the user's input with the user
    await newMakronexaQA.setUser(user);

    // Create a new MakronexaQA instance for the AI response
    const newResponseMakronexaQA = await MakronexaQA.create({
      type: "text",
      message: result.text,
      model: "gpt-3.5-turbo",
      user_id: "5959acb3-5469-459c-9387-f9af3970c853", //cloud
      chat_id: chat_id,
      dataset_id: dataset_id,
    });

    console.log(newResponseMakronexaQA, "newResponseMakronexaQA");
    res.json({ text: result.text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while querying the file' });
  }
});


router.post('/:user_id/:dataset_id/chats/:chat_id/chat', async (req, res) => {
  try {
    const chat = new ChatOpenAI({ temperature: 0 });

    const chatPrompt = ChatPromptTemplate.fromPromptMessages([
      SystemMessagePromptTemplate.fromTemplate(
        `You are a Socratic tutor. Use the following principles in responding to students:\n
        - Ask thought-provoking, open-ended questions that challenge students' preconceptions and encourage them to engage in deeper reflection and critical thinking.\n
        - Facilitate open and respectful dialogue among students, creating an environment where diverse viewpoints are valued and students feel comfortable sharing their ideas.\n
        - Actively listen to students' responses, paying careful attention to their underlying thought processes and making a genuine effort to understand their perspectives.\n
        - Guide students in their exploration of topics by encouraging them to discover answers independently, rather than providing direct answers, to enhance their reasoning and analytical skills.\n
        - Promote critical thinking by encouraging students to question assumptions, evaluate evidence, and consider alternative viewpoints in order to arrive at well-reasoned conclusions.\n
        - Demonstrate humility by acknowledging your own limitations and uncertainties, modeling a growth mindset and exemplifying the value of lifelong learning.`
      ),
      new MessagesPlaceholder('history'),
      HumanMessagePromptTemplate.fromTemplate('{input}'),
    ]);
    const chain = new ConversationChain({
      memory: new BufferMemory({ returnMessages: true, memoryKey: 'history' }),
      prompt: chatPrompt,
      llm: chat,
    });

    const response = await chain.call({
      input: req.body.question,
    });
    // const response = await chain.call({
    //   input: 'how old is Mr Gatsby?',
    // });
    // const response2 = await chain.call({
    //   input: 'where does he live?',
    // });

    res.json( response );
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while processing the chat' });
  }
});

export default router;


// LANGNAIN

import express from 'express';
import { OpenAI } from 'langchain/llms/openai';
import { RetrievalQAChain, loadQAStuffChain } from 'langchain/chains';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
// import * as dotenv from 'dotenv';
import { FaissStore } from 'langchain/vectorstores/faiss';
import { QdrantVectorStore } from 'langchain/vectorstores/qdrant';

import { TextLoader } from 'langchain/document_loaders/fs/text';
import { CharacterTextSplitter } from 'langchain/text_splitter';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import path from 'path';
// import {PGVector} from "langchain/vectorstores/pgvector"
import { fileURLToPath } from 'url';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import {ConversationChain} from"langchain/chains"
import {
  MessagesPlaceholder,
  SystemMessagePromptTemplate,
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
} from 'langchain/prompts';
import { BufferMemory } from 'langchain/memory';
// QDRANT 
import {QdrantClient} from '@qdrant/js-client-rest';
// import {PointStruct} from '@qdrant'
const client = new QdrantClient({
  url: 'https://a5a98b7e-35ea-44f9-8e2f-38cf6148a624.us-east-1-0.aws.cloud.qdrant.io:6333',
  apiKey: '7KXsf0loGbF7clyyLbZ4wFgql0vQyWp2UmsMa0RzAUE7RA4PzIJjRg',
});


// QDRANT 
function getFilePath(filename) {
  const routerDirectory = path.dirname(fileURLToPath(import.meta.url));
  const fullPath = path.join(routerDirectory, filename);
  return fullPath;
}
const filePath = getFilePath('TheGreatGatsby.txt');

// const router = express.Router();
// dotenv.config();

// POST endpoint to save the file
router.post('/save', async (req, res) => {
  try {
    const loader = new TextLoader(filePath);
    const docs = await loader.load();

    const splitter = new CharacterTextSplitter({
      chuckSize: 200,
      chunkOverlap: 50,
    });

    const documents = await splitter.splitDocuments(docs);
    console.log(documents);
    
    
    const embeddings = new OpenAIEmbeddings();
    const vectorstore = await FaissStore.fromDocuments(documents, embeddings);
    // const file = await vectorstore.save('./');
console.log(vectorstore,"VECTORSTORE")
    // if (file) {
    //   res.json({ message: 'File saved successfully' });
    // }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while saving the file' });
  }
});

// GET endpoint to query the file
router.get('/query', async (req, res) => {
  try {
    const embeddings = new OpenAIEmbeddings();
    const vectorStore = await FaissStore.load('./', embeddings);
    const model = new OpenAI({ temperature: 0 });

    const chain = new RetrievalQAChain({
      combineDocumentsChain: loadQAStuffChain(model),
      retriever: vectorStore.asRetriever(),
      returnSourceDocuments: true,
    });

    const result = await chain.call({
      query: 'what is the book , the great gatsby about', // Get the question from the query parameter
    });

    res.json({ text: result.text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while querying the file' });
  }
});

router.get('/chat', async (req, res) => {
  try {
    const chat = new ChatOpenAI({ temperature: 0 });

    const chatPrompt = ChatPromptTemplate.fromPromptMessages([
      SystemMessagePromptTemplate.fromTemplate(
        `You are a Socratic tutor. Use the following principles in responding to students:\n
        - Ask thought-provoking, open-ended questions that challenge students' preconceptions and encourage them to engage in deeper reflection and critical thinking.\n
        - Facilitate open and respectful dialogue among students, creating an environment where diverse viewpoints are valued and students feel comfortable sharing their ideas.\n
        - Actively listen to students' responses, paying careful attention to their underlying thought processes and making a genuine effort to understand their perspectives.\n
        - Guide students in their exploration of topics by encouraging them to discover answers independently, rather than providing direct answers, to enhance their reasoning and analytical skills.\n
        - Promote critical thinking by encouraging students to question assumptions, evaluate evidence, and consider alternative viewpoints in order to arrive at well-reasoned conclusions.\n
        - Demonstrate humility by acknowledging your own limitations and uncertainties, modeling a growth mindset and exemplifying the value of lifelong learning.`
      ),
      new MessagesPlaceholder('history'),
      HumanMessagePromptTemplate.fromTemplate('{input}'),
    ]);
    const chain = new ConversationChain({
      memory: new BufferMemory({ returnMessages: true, memoryKey: 'history' }),
      prompt: chatPrompt,
      llm: chat,
    });

    const response = await chain.call({
      input: 'how old is Mr Gatsby?',
    });
    const response2 = await chain.call({
      input: 'where does he live?',
    });

    res.json({ response, response2 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while processing the chat' });
  }
});

// export default router;
// LANGNAIN



 // ?If the session is waiting for the phone number
 if (userSession.step === 'awaiting_phone_number') {
  const phoneNumber = text.trim(); // Extract and trim the text from the message

  // Check if we are waiting for a confirmation
  if (userSession.awaitingConfirmation) {
      if (phoneNumber.toLowerCase() === 'y') {
          userSession.awaitingConfirmation = false;
          userSession.step = "registration_complete"; // Move to the next attribute

             // Call the registerUser function to create the user record
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