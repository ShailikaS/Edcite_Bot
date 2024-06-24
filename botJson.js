const express = require('express');
const fs = require('fs').promises;
const openai = require('openai');    
const app = express();
const modelfusion = require('modelfusion');

require('dotenv').config();
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

//console.log("OpenAI API Key:", OPENAI_API_KEY);

app.use(express.json());

const loadJsonData = async (filePath) => {
  try {
    const jsonData = await fs.readFile(filePath, 'utf8');
    return JSON.parse(jsonData);
  } catch (error) {
    console.error(`Error loading JSON file: ${filePath}`, error);
    return null;
  }
};

let vectorIndex = null;
let embeddingModel = null;

app.get('/mydataget', async (req, res) => {
  res.status(200).send("Hello");
});

app.get('/startSession', async (req, res) => {
  const { MemoryVectorIndex, VectorIndexRetriever, splitAtToken, splitTextChunks, streamText, upsertIntoVectorIndex, openai } = modelfusion;

  try {
    const files = [
      'C:/Users/as/Downloads/AI BOT/DemoData.json',
    ];

    const pages = [];
    for (const file of files) {
      console.log(file);
      const jsonData = await loadJsonData(file);
      if (jsonData !== null) {
        pages.push(...jsonData.pages);
      }
    }

    embeddingModel = openai.TextEmbedder({
      model: "text-embedding-ada-002",
    });

    const chunks = await splitTextChunks(
      splitAtToken({
        maxTokensPerChunk: 256,
        tokenizer: embeddingModel.tokenizer,
      }),
      pages
    );
    console.log("pages: ", pages);

    vectorIndex = new MemoryVectorIndex();

    await upsertIntoVectorIndex({
      vectorIndex,
      embeddingModel,
      objects: chunks,
      getValueToEmbed: (chunk) => chunk.text,
    });

    console.log("JSON data loaded.");
    res.send("Session started. JSON files loaded.");
  } catch (error) {
    console.error("Error starting session:", error);
    res.status(500).send("Failed to start session.");
  }
});

app.post('/ask', async (req, res) => {
  const { question } = req.body;
  const { VectorIndexRetriever, retrieve, streamText, openai } = modelfusion;

  try {
    if (!vectorIndex || !embeddingModel) {
      throw new Error("Session not started or JSON data not loaded.");
    }

    const information = await retrieve(
      new VectorIndexRetriever({
        vectorIndex,
        embeddingModel,
        maxResults: 5,
        similarityThreshold: 0.75,
      }),
      question
    );

    const textStream = await streamText({
      model: openai.ChatTextGenerator({ model: "gpt-3.5-turbo", temperature: 0 }),
      prompt: [
        openai.ChatMessage.system(
          `Answer the user's question using only the provided information in pages.\n` +
          `talk friendly with human interactive chat but don't try to add any data additinally only specific with edcite data edcite JSON data which is provided.` +
          `If you receive any question, out of edcite respond with: "Sorry, I'm trained to answer only questions related to Edcite".` +
          `If you want to raise a ticket, use this link: "https://edcite.com".`
        ),
        openai.ChatMessage.user(question),
        openai.ChatMessage.fn({
          fnName: "getInformation",
          content: JSON.stringify(information),
        }),
      ],
    });

    let answer = '';
    for await (const textPart of textStream) {
      answer += textPart;
    }

    res.send(answer);

  } catch (error) {
    console.error("Error processing user question:", error);
    res.status(500).send("Failed to process user question.");
  }
});

app.listen(3000, function (err) {
  if (err) console.log("Error in server setup");
  console.log("Server listening on Port", 3000);
});

console.log("data");
