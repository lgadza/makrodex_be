import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { OpenAI } from "langchain/llms/openai";
import { loadQAStuffChain } from "langchain/chains";
import { Document } from "langchain/document";
export const queryPineconeVectorStoreAndQueryLLM = async (
  client,
  indexName,
  question
) => {
// 3. Start query process
  console.log("Querying Pinecone vector store...");
  const index = client.Index(indexName);
  const queryEmbedding = await new OpenAIEmbeddings().embedQuery(question);
// 6. Query Pinecone index and return top 10 matches
  let queryResponse = await index.query({
    queryRequest: {
      topK: 10,
      vector: queryEmbedding,
      includeMetadata: true,
      includeValues: true,
    },
  });
  console.log(`Found ${queryResponse.matches.length} matches...`);
  console.log(`Asking question: ${question}...`);
  if (queryResponse.matches.length) {
// 9. Create an OpenAI instance and load the QAStuffChain
    const llm = new OpenAI({});
    const chain = loadQAStuffChain(llm);
// 10. Extract and concatenate page content from matched documents
    const concatenatedPageContent = queryResponse.matches
      .map((match) => match.metadata.pageContent)
      .join(" ");
// 11. Execute the chain with input documents and question
    const result = await chain.call({
      input_documents: [new Document({ pageContent: concatenatedPageContent })],
      question: question,
    });
    console.log(`Answer: ${result.text}`);
  } else {
    console.log("Since there are no matches, GPT-3 will not be queried.");
  }
};
