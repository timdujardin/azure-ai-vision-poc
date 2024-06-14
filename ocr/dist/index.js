"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cognitiveservices_computervision_1 = require("@azure/cognitiveservices-computervision");
const ms_rest_js_1 = require("@azure/ms-rest-js");
const fs_1 = __importDefault(require("fs"));
const async_1 = __importDefault(require("async"));
const https_1 = __importDefault(require("https"));
const dotenv = __importStar(require("dotenv"));
const sleep = require("util").promisify(setTimeout);
dotenv.config({ path: "../.env" });
const endpoint = process.env["VISION_ENDPOINT"] || "<your_endpoint>";
const key = process.env["VISION_KEY"] || "<your_key>";
const computerVisionClient = new cognitiveservices_computervision_1.ComputerVisionClient(new ms_rest_js_1.ApiKeyCredentials({ inHeader: { "Ocp-Apim-Subscription-Key": key } }), endpoint);
/**
 * END - Authenticate
 */
function computerVision() {
    async_1.default.series([
        function () {
            return __awaiter(this, void 0, void 0, function* () {
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
                const printedTextSampleURL = "https://cdn.suprabazar.be/media/4a/fd/29/1718265877/Verticaal.jpg";
                // Recognize text in printed image from a URL
                console.log("Read printed text from URL...", printedTextSampleURL.split("/").pop());
                const printedResult = yield readTextFromURL(computerVisionClient, printedTextSampleURL);
                printRecText(printedResult);
                // Perform read and await the result from URL
                function readTextFromURL(client, url) {
                    return __awaiter(this, void 0, void 0, function* () {
                        // To recognize text in a local image, replace client.read() with readTextInStream() as shown:
                        let result = yield client.read(url);
                        // Operation ID is last path segment of operationLocation (a URL)
                        let operation = result.operationLocation.split("/").slice(-1)[0];
                        // Wait for read recognition to complete
                        // result.status is initially undefined, since it's the result of read
                        while (result.status !== "succeeded") {
                            yield sleep(1000);
                            result = yield client.getReadResult(operation);
                        }
                        return result.analyzeResult.readResults; // Return the first page of result. Replace [0] with the desired page if this is a multi-page file such as .pdf or .tiff.
                    });
                }
                // Prints all text from Read result
                function printRecText(readResults) {
                    console.log("Recognized text:");
                    for (const page in readResults) {
                        if (readResults.length > 1) {
                            console.log(`==== Page: ${page}`);
                        }
                        const result = readResults[page];
                        if (result.lines.length) {
                            for (const line of result.lines) {
                                console.log(line.words.map((w) => w.text).join(" "));
                            }
                        }
                        else {
                            console.log("No recognized text.");
                        }
                    }
                }
                /**
                 *
                 * Download the specified file in the URL to the current local folder
                 *
                 */
                function downloadFilesToLocal(url, localFileName) {
                    return new Promise((resolve, reject) => {
                        console.log("--- Downloading file to local directory from: " + url);
                        const request = https_1.default.request(url, (res) => {
                            if (res.statusCode !== 200) {
                                console.log(`Download sample file failed. Status code: ${res.statusCode}, Message: ${res.statusMessage}`);
                                reject();
                            }
                            var data = [];
                            res.on("data", (chunk) => {
                                data.push(chunk);
                            });
                            res.on("end", () => {
                                console.log("   ... Downloaded successfully");
                                fs_1.default.writeFileSync(localFileName, Buffer.concat(data));
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
            });
        },
        function () {
            return new Promise((resolve) => {
                resolve();
            });
        },
    ], (err) => {
        throw err;
    });
}
computerVision();
