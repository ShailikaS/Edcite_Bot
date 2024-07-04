const express = require('express');
const fs = require('fs').promises;

const {getDocument, OPS} = require('pdfjs-dist/legacy/build/pdf.js');
const openai = require('openai');    
const app = express();

require('dotenv').config();
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

console.log("OpenAI API Key:", OPENAI_API_KEY); 

const modelfusion = require('modelfusion');
//console.log("OpenAI API Key:", openai.apiKey);

const isPdf = (buffer) => {
  const pdfSignature = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2D]);
  return buffer.slice(0, 5).equals(pdfSignature);
};

const extractTextFromPage = async (page) => {
  const textContent = await page.getTextContent();
  const pageText = textContent.items
    .filter((item) => item.str != null)
    .map((item) => item.str)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
  return pageText;
};

app.use(express.json());

const extractImagesFromPage = async (page) => {
  const ops = await page.getOperatorList();
  const images = [];

  for (let i = 0; i < ops.fnArray.length; i++) {
    if (ops.fnArray[i] === OPS.paintImageXObject) {
      const objId = ops.argsArray[i][0];
      const obj = await new Promise((resolve) => {
        const checkObj = () => {
          const resolvedObj = page.objs.get(objId);
          if (resolvedObj) {
            resolve(resolvedObj);
          } else {
            setTimeout(checkObj, 100);
          }
        };
        checkObj();
      });

      if (obj) {
        images.push({
          rawData: obj.data,
          width: obj.width,
          height: obj.height,
          colorSpace: obj.colorSpace ? obj.colorSpace.name : null,
          bitsPerComponent: obj.bitsPerComponent,
        });
      }
    }
  }

  return JSON.stringify(images);
};

const loadPdfPages = async (filePath) => {
  try {
    const pdfData = await fs.readFile(filePath);

    if (!isPdf(pdfData)) {
      throw new Error("File is not a valid PDF");
    }

    const pdf = await getDocument({
      data: new Uint8Array(
        pdfData.buffer,
        pdfData.byteOffset,
        pdfData.byteLength
      ),
      useSystemFonts: true,
    }).promise;

    const numPages = pdf.numPages;
    const pageContents = [];

    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const text = await extractTextFromPage(page);
      const images = await extractImagesFromPage(page);

      pageContents.push({
        pageNumber: i,
        text,
        images,
      });
    }

    return pageContents;
  } catch (error) {
    console.error(`Error loading PDF file: ${filePath}`, error);
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
      'C:/Users/edcit/Downloads/BotApp/copy-questions1.pdf',
     ];

    const pages = [];
    for (const file of files) {
      console.log(file);
      const pdfPages = await loadPdfPages(file);
      if (pdfPages !== null) {
        pages.push(...pdfPages);
      }
      console.log("pages : ",pdfPages);
    }

    //pdfData = pages;

    embeddingModel = openai.TextEmbedder({
      model: "text-embedding-ada-002",
    });
  
    //console.log(embeddingModel);
  
    const chunks = await splitTextChunks(
      splitAtToken({
        maxTokensPerChunk: 256,
        tokenizer: embeddingModel.tokenizer,
      }),
      pages
    );
  
    vectorIndex = new MemoryVectorIndex();
  
    await upsertIntoVectorIndex({
      vectorIndex,
      embeddingModel,
      objects: chunks,
      getValueToEmbed: (chunk) => chunk.text,
    });
  

    console.log("PDF data loaded.");
    res.send("Session started. PDF files loaded.");
  } catch (error) {
    console.error("Error starting session:", error);
    res.status(500).send("Failed to start session.");
  }
});

app.post('/ask', async (req, res) => {
  const { question } = req.body;
  const { VectorIndexRetriever,retrieve, streamText, openai } = modelfusion;
  //const { vectorIndex, embeddingModel } = await main();
try{
  if (!vectorIndex || !embeddingModel) {
    throw new Error("Session not started or PDF data not loaded.");
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
    model: openai.ChatTextGenerator({ model: "gpt-4", temperature: 0 }),
    prompt: [
      openai.ChatMessage.system(
        `Answer the user's question using only the provided information in pages.\n` +
        `talk friendly with human interactive chat but don't try to add any data additinally only specific with edcite data edcite pdf data which is provided.`+
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
  if (err) console.log("Error in server setup")
  console.log("Server listening on Port", 3000);
});

console.log("data");
