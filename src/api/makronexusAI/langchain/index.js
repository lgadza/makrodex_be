
import express from 'express';
import {DirectoryLoader} from "langchain/document_loaders/fs/directory"
import { OpenAI } from 'langchain/llms/openai';
import { RetrievalQAChain, loadQAStuffChain } from 'langchain/chains';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
// import * as dotenv from 'dotenv';
import { FaissStore } from 'langchain/vectorstores/faiss';
import { QdrantVectorStore } from 'langchain/vectorstores/qdrant';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { CharacterTextSplitter } from 'langchain/text_splitter';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { CSVLoader } from 'langchain/document_loaders/fs/csv';
import { DocxLoader } from 'langchain/document_loaders/fs/docx';
import path from 'path';
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
import multer from 'multer';
import { Tiktoken } from '@dqbd/tiktoken/lite';
import { load } from '@dqbd/tiktoken/load';
import  registry  from '@dqbd/tiktoken/registry.json' assert{type:"json"};
import  models  from '@dqbd/tiktoken/model_to_encoding.json' assert{type:"json"};
import { type } from 'os';
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
const filePath = getFilePath("The Great Gatsby.txt");

const upload = multer({ storage: storage });
const router = express.Router();
// dotenv.config();

// POST endpoint to save the file
router.post('/save',upload.single('file'), async (req, res) => {
  const collectionName="Makronexus_EduCenter"
  try {
    const { title, description,fileExtension, file, subject, level } = req.body;
    const fileDataAsString = req.file;
    console.log(fileDataAsString,"FILEPAtH");
    if(fileExtension==='pdf'){
      const filePath = req.file.path;
      console.log(filePath,"FILE PATHS")
      const loader= new DirectoryLoader(getFilePath('../../../../uploads'),{
      ".pdf": (path)=> new  PDFLoader(path),
      ".csv": (path)=> new  CSVLoader(path),
      ".txt": (path)=> new  TextLoader(path),
      // ".docx": (path)=> new  DocxLoader(path),
      })
    const docs = await loader.load();
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
    console.log(documents);
        const embeddings = new OpenAIEmbeddings();
    const vectorstore = await QdrantVectorStore.fromDocuments(documents, embeddings,
      {
        url: process.env.QDRANT_URL,
         collectionName: collectionName,
         apiKey:process.env.QDRANT_DB_KEY
      });
      console.log(vectorstore,"VECTORSTORE")
    if (vectorstore) {
      fs.unlinkSync(filePath);
      res.json({ message: 'File saved successfully' });
    }
    
    }
    // const loader = new TextLoader(filePath);
    // const docs = await loader.load();
   

    // const splitter = new CharacterTextSplitter({
    //   chuckSize: 200,
    //   chunkOverlap: 20,
    // });

    // const documents = await splitter.splitDocuments(docs);
    // console.log(documents);
    
    
//     const embeddings = new OpenAIEmbeddings();
//     const vectorstore = await QdrantVectorStore.fromDocuments(documents, embeddings,
//       {
//         url: process.env.QDRANT_URL,
//          collectionName: collectionName,
//          apiKey:process.env.QDRANT_DB_KEY
//       });
//     // const file = await vectorstore.save('./');
// console.log(vectorstore,"VECTORSTORE")
//     if (vectorstore) {
//       res.json({ message: 'File saved successfully' });
//     }
// res.json({ message: 'File uploaded and processed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while saving the file' });
  }
});

// GET endpoint to query the file
router.get('/query', async (req, res) => {
  const collectionName="Makronexus_EduCenter"

  try {
    const embeddings = new OpenAIEmbeddings();
    const vectorStore = await QdrantVectorStore.fromExistingCollection(
      embeddings,
      {
        url: process.env.QDRANT_URL,
        collectionName: collectionName,
        apiKey:process.env.QDRANT_DB_KEY

      }
    );;
    const model = new OpenAI({ temperature: 0,model:"gpt-3.5-turbo" });

    const chain = new RetrievalQAChain({
      combineDocumentsChain: loadQAStuffChain(model),
      retriever: vectorStore.asRetriever(),
      returnSourceDocuments: true,
    });

    const result = await chain.call({
      query: 'How many calls are being handled daily?', // Get the question from the query parameter
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

export default router;