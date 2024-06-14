const { ImageAnalysisClient } = require("@azure-rest/ai-vision-image-analysis");
const createClient = require("@azure-rest/ai-vision-image-analysis").default;
const { AzureKeyCredential } = require("@azure/core-auth");

// Load the .env file if it exists
require("dotenv").config({ path: "../.env" });

const endpoint = process.env["VISION_ENDPOINT"];
const key = process.env["VISION_KEY"];

const credential = new AzureKeyCredential(key);
const client = createClient(endpoint, credential);

const features = ["Caption", "Read"];

const imageUrl =
  "https://assets.iodigital.com/f/119964/1200x1200/bd99aab87b/1.png/m/800x800";

async function analyzeImageFromUrl() {
  const result = await client.path("/imageanalysis:analyze").post({
    body: {
      url: imageUrl,
    },
    queryParameters: {
      features: features,
    },
    contentType: "application/json",
  });

  const iaResult = result.body;

  if (iaResult.captionResult) {
    console.log(
      `Caption: ${iaResult.captionResult.text} (confidence: ${iaResult.captionResult.confidence})`
    );
  }
  if (iaResult.readResult) {
    iaResult.readResult.blocks.forEach((block) =>
      console.log(`Text Block: ${JSON.stringify(block)}`)
    );
  }
}

analyzeImageFromUrl();
