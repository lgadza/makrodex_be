// // other file loaders (https://js.langchain.com/docs/modules/indexes/document_loaders/examples/file_loaders/)
// import { PineconeClient } from "@pinecone-database/pinecone";
// import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
// import { TextLoader } from "langchain/document_loaders/fs/text";
// import { PDFLoader } from "langchain/document_loaders/fs/pdf";
// import * as dotenv from "dotenv";
// import { createPineconeIndex } from "./createPineconeIndex.js";
// import { updatePinecone } from "./updatePinecone.js";
// import { queryPineconeVectorStoreAndQueryLLM } from "./queryPineconeAndQueryGPT.js";

// dotenv.config();
// // DirectoryLoader to load documents from the ./documents directory
// const loader = new DirectoryLoader("../../../../documents", {
//     ".txt": (path) => new TextLoader(path),
//     ".pdf": (path) => new PDFLoader(path),
// });
// const docs = await loader.load();
// // variables for the filename, question, and index settings
// const question = "Who is mr Gatsby?";
// const indexName = "your-pinecone-index-name";
// const vectorDimension = 1536;
// // Initialize Pinecone client with API key and environment
// const client = new PineconeClient();
// await client.init({
//   apiKey: process.env.PINECONE_API_KEY,
//   environment: process.env.PINECONE_ENVIRONMENT,
// });
// //  The main async function
// (async () => {
// //  Check if Pinecone index exists and create if necessary
//   await createPineconeIndex(client, indexName, vectorDimension);
// // Update Pinecone vector store with document embeddings
//   await updatePinecone(client, indexName, docs);
// // Query Pinecone vector store and GPT model for an answer
//   await queryPineconeVectorStoreAndQueryLLM(client, indexName, question);
// })();
// import express from 'express';
// import { PineconeClient } from '@pinecone-database/pinecone';
// import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';
// import { TextLoader } from 'langchain/document_loaders/fs/text';
// import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
// import dotenv from 'dotenv';
// import { createPineconeIndex } from './createPineconeIndex.js';
// import { updatePinecone } from './updatePinecone.js';
// import { queryPineconeVectorStoreAndQueryLLM } from './queryPineconeAndQueryGPT.js';

// dotenv.config();

// const pineconeRouter = express.Router();

// // DirectoryLoader to load documents from the ./documents directory
// const loader = new DirectoryLoader('../../../../documents', {
//   '.txt': (path) => new TextLoader(path),
//   '.pdf': (path) => new PDFLoader(path),
// });

// pineconeRouter.post('/load-documents', async (req, res) => {
//   try {
//     const docs = await loader.load();
//     // variables for the filename, question, and index settings
//     const question = 'Who is Romeo and Juliet?';
//     const indexName = 'makronexus';
//     const vectorDimension = 1536;

//     // Initialize Pinecone client with API key and environment
//     const client = new PineconeClient();
//     await client.init({
//       apiKey: process.env.PINECONE_API_KEY,
//       environment: process.env.PINECONE_ENVIRONMENT,
//     });

//     // Check if Pinecone index exists and create if necessary
//     await createPineconeIndex(client, indexName, vectorDimension);

//     // Update Pinecone vector store with document embeddings
//     await updatePinecone(client, indexName, docs);

//     // Query Pinecone vector store and GPT model for an answer
//     await queryPineconeVectorStoreAndQueryLLM(client, indexName, question);

//     res.status(200).json({ message: 'Documents loaded and processed successfully.' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'An error occurred while processing documents.' });
//   }
// });

// export default pineconeRouter;
import express from 'express';
import { PineconeClient } from '@pinecone-database/pinecone';
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import dotenv from 'dotenv';
import { createPineconeIndex, updatePinecone, queryPineconeVectorStoreAndQueryLLM } from './helpers.js';  // Import helper functions

dotenv.config();

const pineconeRouter = express.Router();

const loader = new DirectoryLoader('../../../../documents', {
  '.txt': (path) => new TextLoader(path),
  '.pdf': (path) => new PDFLoader(path),
});

pineconeRouter.post('/load-documents', async (req, res) => {
  try {
    const docs = await loader.load();
    const question = 'Who is Romeo and Juliet?';
    const indexName = 'makronexus';
    const vectorDimension = 1536;

    const client = new PineconeClient();
    await client.init({
      apiKey: process.env.PINECONE_API_KEY,
      environment: process.env.PINECONE_ENVIRONMENT,
    });

    await createPineconeIndex(client, indexName, vectorDimension);
    await updatePinecone(client, indexName, docs);
    await queryPineconeVectorStoreAndQueryLLM(client, indexName, question);

    res.status(200).json({ message: 'Documents loaded and processed successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while processing documents.' });
  }
});

export default pineconeRouter;
