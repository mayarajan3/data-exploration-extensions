
import { ArgumentType, BlockType, Environment, ExtensionMenuDisplayDetails, extension, buttonBlock, block } from "$common";
import OpenAI from "openai";

// Commenting out API key
const openai = new OpenAI({ apiKey: '', dangerouslyAllowBrowser: true });

// Initializing variables
var text : string;
var gptanswer : string = "Nothing asked yet...";
var question : string = "";
var chunkSize = 500;
var chunks = [];
var topChunks = [];
var topChunkNumber = 3;

// Using OpenAI to get embedding information
async function get_embedding(input : string) {
   input = input.replace("\n", " ")
   return await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: input,
      encoding_format: "float",
    });
}

// Calculating the cosine similarity using text values
function cosineDistance(text1: string, text2: string) : Promise<number> | void {
  // Collect the embeddings
  return Promise.all([get_embedding(text1), get_embedding(text2)])
    .then(([result1, result2]) => {
      const embed1 = result1.data[0].embedding;
      const embed2 = result2.data[0].embedding;
      // const embed1 = [0];
      // const embed2 = [0];
      return cosineSimilarity(embed1, embed2);
    })
    .catch((error) => {
      console.error("Error calculating cosine distance:", error);
      throw error;
    });
}

// Making sure the response doesn't end on a halfway sentence
function cutOffHalfwaySentence(gptresponse : string) : string {
  const sentences = gptresponse.match(/[^\.!\?]+[\.!\?]+/g);
  const midpoint = Math.floor(gptresponse.length / 2);
  let nearestSentence = '';
  let minDistance = Infinity;
  if (sentences) {
    sentences.forEach(sentence => {
      const sentenceMidpoint = Math.floor((sentence.length - 1) / 2);
      const distance = Math.abs(midpoint - (sentenceMidpoint + sentence.length));
      if (distance < minDistance) {
          nearestSentence = sentence;
          minDistance = distance;
      }
    });
    const endIndex = gptresponse.indexOf(nearestSentence) + nearestSentence.length;
    return gptresponse.slice(0, endIndex).trim(); 
  } else {
    return gptresponse;
  }
}

// Similarity utility functions
function dotProduct(vecA: number[], vecB: number[]) : number{
  let product = 0;
  for(let i=0;i<vecA.length;i++){
      product += vecA[i] * vecB[i];
  }
  return product;
}

function magnitude(vec: number[]) : number{
  let sum = 0;
  for (let i = 0;i<vec.length;i++){
      sum += vec[i] * vec[i];
  }
  return Math.sqrt(sum);
}

function cosineSimilarity(vecA : number[] ,vecB: number[]) : number {
  return dotProduct(vecA,vecB)/ (magnitude(vecA) * magnitude(vecB));
}

// Splitting the uploaded text file into chunks for processing
function splitStringIntoChunks(inputString: string, chunkSize: number): string[] {
  const chunks: string[] = [];
  if (inputString) {
    for (let i = 0; i < inputString.length; i += chunkSize) {
      chunks.push(inputString.substring(i, i + chunkSize));
    }
    return chunks;
  }
  return [];
}

type ChunkSimilarity = {
  chunk: string; 
  sim: number; 
};

// Using the chunks to calculate the top most similar pieces of text
async function calculateSimilarities() : Promise<string[]> {
    const query = question;
    const similarityPromises = chunks.map(async (chunk) => {
        const sim = await cosineDistance(chunk, query);
        return { chunk, sim };
    });

    return Promise.all(similarityPromises).then((similarities) => {
      similarities.sort((a: ChunkSimilarity, b: ChunkSimilarity) => b.sim - a.sim);
      topChunks = [];
      for (let i = 0; i < topChunkNumber && i < similarities.length; i++) {
        topChunks.push(similarities[i].chunk);
      }
      return topChunks;
  });
}

// Using the OpenAI API to use the top chunks to ask the user's question
function askQuestion() : void {
    calculateSimilarities().then(result => {
      console.log("CHUNKS:", topChunks);
      if (chunks.length > 0 && chunks[0] !== undefined) {
        const response = openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              "role": "system",
              "content": `Answer the question based only on this information and nothing else: \n\n ${topChunks[0]} \n\n ${topChunks[1]} \n\n ${topChunks[2]}`
            },
            {
              "role": "user",
              "content": question,
            }
          ],
          temperature: 0.7,
          max_tokens: 65,
          top_p: 1,
        }).then(result => {
            gptanswer = cutOffHalfwaySentence(result.choices[0].message.content);
        });
      } else {
        gptanswer = "Nothing asked yet..."
      }
    })
}

// Utiity function for if the user changes the chunk size
function resetChunks(size : number) {
  chunks = splitStringIntoChunks(text, size);
}

const details: ExtensionMenuDisplayDetails = {
  name: "Data Explorer",
  description: "Explore your own data with RAG and LLMs",
  iconURL: "Replace with the name of your icon image file (which should be placed in the same directory as this file)",
  insetIconURL: "Replace with the name of your inset icon image file (which should be placed in the same directory as this file)"
};


export default class dataExplorer extends extension(details, "ui", "customArguments") {

  init(env: Environment) {
    
  }

  // Utility function for processing the uploaded file
  setText(fileText : string) { 
    text = fileText;
    chunks = splitStringIntoChunks(text, chunkSize);  
  }

  @buttonBlock("Upload file")
  showFileOpener() {
    this.openUI("FileOpener", "Upload a file here!");
  }

  // Block for setting the chunk size
  @block((self) => ({
    type: BlockType.Command,
    text: (size) => `Enter chunk size here: ${size}`,
    arg: { type: ArgumentType.Number, defaultValue: 500 },
  }))
  changeChunkSize(size: number) {
    chunkSize = size;
    resetChunks(chunkSize);
  }

  // Block for asking a question
  @block((self) => ({
    type: BlockType.Command,
    text: (query) => `Ask question: ${query}`,
    arg: { type: ArgumentType.String, defaultValue: "Enter question here..." },
  }))
  askQuestionBlock(query: string) {
    question = query;
    gptanswer = "Loading...";
    askQuestion();
  }

  // Block for number of chunks to be considered
  @block((self) => ({
    type: BlockType.Command,
    text: (count) => `Consider ${count} chunks`,
    arg: { type: ArgumentType.Number, defaultValue: 3 },
  }))
  setTopChunkNumber(count: number) {
    topChunkNumber = count;
  }

  // Block for displaying the OpenAI answer
  @block((self) => ({
    type: BlockType.Reporter,
    text: `Report answer`, 
  }))
  reportAnswer() : string {
    return gptanswer;  
  }

  // Block for displaying the answer's context
  @block((self) => ({
    type: BlockType.Reporter,
    text: `Report top chunk`, 
  }))
  reportChunk() : string {
    if (gptanswer == "Loading...") {
      return "Loading...";
    } else if (gptanswer == "Nothing asked yet...") {
      return "Nothing asked yet...";
    } else {
      return topChunks[0];
    }
  }

}
