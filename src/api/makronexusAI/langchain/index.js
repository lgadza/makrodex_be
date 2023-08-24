// import express from 'express';
// import { OpenAI } from 'langchain/llms';
// import { RetrievalQAChain, loadQAStuffChain } from 'langchain/chains';
// import { OpenAIEmbeddings } from 'langchain/embeddings';
// import * as dotenv from 'dotenv';
// import { FaissStore } from 'langchain/vectorstores/faiss';
// import { TextLoader } from 'langchain/document_loaders/fs/text';
// import { CharacterTextSplitter } from 'langchain/text_splitter';
// import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
// import path from 'path';
// import { fileURLToPath } from 'url';
// import { ChatOpenAI } from 'langchain/chat_models/openai';
// import {ConversationChain} from"langchain/chains"
// import {
//   MessagesPlaceholder,
//   SystemMessagePromptTemplate,
//   ChatPromptTemplate,
//   HumanMessagePromptTemplate,
// } from 'langchain/prompts';
// import { BufferMemory } from 'langchain/memory';
// const CONNECTION_STRING='postgresql+psycopg2://postgres:E1a2g3l4e!@localhost:5432/makrodex schools'
// const COLLECTION_NAME="state_of_union_vectors"
// function getFilePath(filename) {
//   const routerDirectory = path.dirname(fileURLToPath(import.meta.url));
//   const fullPath = path.join(routerDirectory, filename);
//   return fullPath;
// }
// const filePath = getFilePath('TheGreatGatsby.txt');

// const router = express.Router();
// dotenv.config();

// // POST endpoint to save the file
// router.post('/save', async (req, res) => {
//   try {
//     const loader = new TextLoader(filePath);
//     const docs = await loader.load();

//     const splitter = new CharacterTextSplitter({
//       chuckSize: 200,
//       chunkOverlap: 50,
//     });

//     const documents = await splitter.splitDocuments(docs);
//     console.log(documents);

//     const embeddings = new OpenAIEmbeddings();
//     const vectorstore = await FaissStore.fromDocuments(documents, embeddings);
//     const file = await vectorstore.save('./');

//     if (file) {
//       res.json({ message: 'File saved successfully' });
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'An error occurred while saving the file' });
//   }
// });

// // GET endpoint to query the file
// router.get('/query', async (req, res) => {
//   try {
//     const embeddings = new OpenAIEmbeddings();
//     const vectorStore = await FaissStore.load('./', embeddings);
//     const model = new OpenAI({ temperature: 0 });

//     const chain = new RetrievalQAChain({
//       combineDocumentsChain: loadQAStuffChain(model),
//       retriever: vectorStore.asRetriever(),
//       returnSourceDocuments: true,
//     });

//     const result = await chain.call({
//       query: 'what is the book , the great gatsby about', // Get the question from the query parameter
//     });

//     res.json({ text: result.text });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'An error occurred while querying the file' });
//   }
// });

// router.get('/chat', async (req, res) => {
//   try {
//     const chat = new ChatOpenAI({ temperature: 0 });

//     const chatPrompt = ChatPromptTemplate.fromPromptMessages([
//       SystemMessagePromptTemplate.fromTemplate(
//         `You are a Socratic tutor. Use the following principles in responding to students:\n
//         - Ask thought-provoking, open-ended questions that challenge students' preconceptions and encourage them to engage in deeper reflection and critical thinking.\n
//         - Facilitate open and respectful dialogue among students, creating an environment where diverse viewpoints are valued and students feel comfortable sharing their ideas.\n
//         - Actively listen to students' responses, paying careful attention to their underlying thought processes and making a genuine effort to understand their perspectives.\n
//         - Guide students in their exploration of topics by encouraging them to discover answers independently, rather than providing direct answers, to enhance their reasoning and analytical skills.\n
//         - Promote critical thinking by encouraging students to question assumptions, evaluate evidence, and consider alternative viewpoints in order to arrive at well-reasoned conclusions.\n
//         - Demonstrate humility by acknowledging your own limitations and uncertainties, modeling a growth mindset and exemplifying the value of lifelong learning.`
//       ),
//       new MessagesPlaceholder('history'),
//       HumanMessagePromptTemplate.fromTemplate('{input}'),
//     ]);
//     const chain = new ConversationChain({
//       memory: new BufferMemory({ returnMessages: true, memoryKey: 'history' }),
//       prompt: chatPrompt,
//       llm: chat,
//     });

//     const response = await chain.call({
//       input: 'how old is Mr Gatsby?',
//     });
//     const response2 = await chain.call({
//       input: 'where does he live?',
//     });

//     res.json({ response, response2 });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'An error occurred while processing the chat' });
//   }
// });

// export default router;
import express from 'express';
import { OpenAI } from 'langchain/llms';
import { RetrievalQAChain, loadQAStuffChain } from 'langchain/chains';
import { OpenAIEmbeddings } from 'langchain/embeddings';
import * as dotenv from 'dotenv';
import { FaissStore } from 'langchain/vectorstores/faiss';
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
const CONNECTION_STRING='postgresql+psycopg2://postgres:E1a2g3l4e!@localhost:5432/makronexus-library'
const COLLECTION_NAME="state_of_union_vectors"
function getFilePath(filename) {
  const routerDirectory = path.dirname(fileURLToPath(import.meta.url));
  const fullPath = path.join(routerDirectory, filename);
  return fullPath;
}
const filePath = getFilePath('TheGreatGatsby.txt');

const router = express.Router();
dotenv.config();

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
    const vectorstore = await FaissStore.fromDocuments(documents, embeddings,COLLECTION_NAME,CONNECTION_STRING);
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

export default router;