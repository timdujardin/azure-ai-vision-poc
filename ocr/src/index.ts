// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { ComputerVisionClient } from "@azure/cognitiveservices-computervision";
import { ApiKeyCredentials } from "@azure/ms-rest-js";
import fs from "fs";
import async from "async";
import https from "https";
import * as dotenv from "dotenv";

const sleep = require("util").promisify(setTimeout);

dotenv.config({ path: "../.env" });

const endpoint: string = process.env["VISION_ENDPOINT"] || "<your_endpoint>";
const key: string = process.env["VISION_KEY"] || "<your_key>";

const computerVisionClient = new ComputerVisionClient(
  new ApiKeyCredentials({ inHeader: { "Ocp-Apim-Subscription-Key": key } }),
  endpoint
);
/**
 * END - Authenticate
 */

function computerVision() {
  async.series(
    [
      async function () {
        /**
         * OCR: READ PRINTED & HANDWRITTEN TEXT WITH THE READ API
         * Extracts text from images using OCR (optical character recognition).
         */
        console.log("-------------------------------------------------");
        console.log("READ PRINTED, HANDWRITTEN TEXT AND PDF");
        console.log();

        // URL images containing printed and/or handwritten text.
        // The URL can point to image files (.jpg/.png/.bmp) or multi-page files (.pdf, .tiff).
        // iO - iodigital.com: https://assets.iodigital.com/f/119964/1080x1080/406d3c7503/oorlogswond_depodcast_square-1080px.jpg/m/800x800
        // SupraBazar: https://cdn.suprabazar.be/media/4a/fd/29/1718265877/Verticaal.jpg
        const printedTextSampleURL =
          "https://assets.iodigital.com/f/119964/1080x1080/406d3c7503/oorlogswond_depodcast_square-1080px.jpg/m/800x800";

        // Recognize text in printed image from a URL
        console.log(
          "Read printed text from URL...",
          printedTextSampleURL.split("/").pop()
        );
        const printedResult = await readTextFromURL(
          computerVisionClient,
          printedTextSampleURL
        );
        printRecText(printedResult);

        // Perform read and await the result from URL
        async function readTextFromURL(
          client: ComputerVisionClient,
          url: string
        ) {
          // To recognize text in a local image, replace client.read() with readTextInStream() as shown:
          let result: any = await client.read(url);
          // Operation ID is last path segment of operationLocation (a URL)
          let operation = result.operationLocation.split("/").slice(-1)[0];

          // Wait for read recognition to complete
          // result.status is initially undefined, since it's the result of read
          while (result.status !== "succeeded") {
            await sleep(1000);
            result = await client.getReadResult(operation);
          }
          return result.analyzeResult.readResults; // Return the first page of result. Replace [0] with the desired page if this is a multi-page file such as .pdf or .tiff.
        }

        // Prints all text from Read result
        function printRecText(readResults: any[]) {
          console.log("Recognized text:");
          for (const page in readResults) {
            if (readResults.length > 1) {
              console.log(`==== Page: ${page}`);
            }
            const result = readResults[page];
            if (result.lines.length) {
              for (const line of result.lines) {
                console.log(line.words.map((w: any) => w.text).join(" "));
              }
            } else {
              console.log("No recognized text.");
            }
          }
        }

        /**
         *
         * Download the specified file in the URL to the current local folder
         *
         */
        function downloadFilesToLocal(
          url: string,
          localFileName: fs.PathOrFileDescriptor
        ) {
          return new Promise<void>((resolve, reject) => {
            console.log("--- Downloading file to local directory from: " + url);
            const request = https.request(url, (res) => {
              if (res.statusCode !== 200) {
                console.log(
                  `Download sample file failed. Status code: ${res.statusCode}, Message: ${res.statusMessage}`
                );
                reject();
              }
              var data: any[] = [];
              res.on("data", (chunk) => {
                data.push(chunk);
              });
              res.on("end", () => {
                console.log("   ... Downloaded successfully");
                fs.writeFileSync(localFileName, Buffer.concat(data));
                resolve();
              });
            });
            request.on("error", function (e) {
              console.log(e.message);
              reject();
            });
            request.end();
          });
        }

        /**
         * END - Recognize Printed & Handwritten Text
         */
        console.log();
        console.log("-------------------------------------------------");
        console.log("End of quickstart.");
      },
      function () {
        return new Promise<void>((resolve) => {
          resolve();
        });
      },
    ],
    (err) => {
      throw err;
    }
  );
}

computerVision();
