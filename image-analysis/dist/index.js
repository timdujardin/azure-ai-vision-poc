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
Object.defineProperty(exports, "__esModule", { value: true });
const ai_vision_image_analysis_1 = __importStar(require("@azure-rest/ai-vision-image-analysis"));
const core_auth_1 = require("@azure/core-auth");
// Load the .env file if it exists
const dotenv = __importStar(require("dotenv"));
dotenv.config({ path: "../.env" });
const endpoint = process.env["VISION_ENDPOINT"] || "<your_endpoint>";
const key = process.env["VISION_KEY"] || "<your_key>";
const credential = new core_auth_1.AzureKeyCredential(key);
const client = (0, ai_vision_image_analysis_1.default)(endpoint, credential);
const features = [
    "Caption",
    "DenseCaptions",
    "Objects",
    "People",
    "Read",
    "SmartCrops",
    "Tags",
];
// iO - iodigital.com: https://assets.iodigital.com/f/119964/1200x1200/bd99aab87b/1.png/m/800x800
// Toyota Used Car:
// https://used-car-publisher.toyota-europe.com/images/cf8306a2-ffb4-485d-b0a9-eebded8ff0ee_a0670dbbd8c4b7d91bfbb6d3c58415bc.JPG
// SupraBazar: https://cdn.suprabazar.be/media/4a/fd/29/1718265877/Verticaal.jpg
const imageUrl = "https://used-car-publisher.toyota-europe.com/images/cf8306a2-ffb4-485d-b0a9-eebded8ff0ee_a0670dbbd8c4b7d91bfbb6d3c58415bc.JPG";
function analyzeImageFromUrl() {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield client.path("/imageanalysis:analyze").post({
            body: {
                url: imageUrl,
            },
            queryParameters: {
                features: features,
            },
            contentType: "application/json",
        });
        if ((0, ai_vision_image_analysis_1.isUnexpected)(result)) {
            throw result.body.error;
        }
        console.log(`Model Version: ${result.body.modelVersion}`);
        console.log(`Image Metadata: ${JSON.stringify(result.body.metadata)}`);
        if (result.body.captionResult)
            console.log(`Caption: ${result.body.captionResult.text} (confidence: ${result.body.captionResult.confidence})`);
        if (result.body.denseCaptionsResult)
            result.body.denseCaptionsResult.values.forEach((denseCaption) => console.log(`Dense Caption: ${JSON.stringify(denseCaption)}`));
        if (result.body.objectsResult)
            result.body.objectsResult.values.forEach((object) => console.log(`Object: ${JSON.stringify(object)}`));
        if (result.body.peopleResult)
            result.body.peopleResult.values.forEach((person) => console.log(`Person: ${JSON.stringify(person)}`));
        if (result.body.readResult)
            result.body.readResult.blocks.forEach((block) => console.log(`Text Block: ${JSON.stringify(block)}`));
        if (result.body.smartCropsResult)
            result.body.smartCropsResult.values.forEach((smartCrop) => console.log(`Smart Crop: ${JSON.stringify(smartCrop)}`));
        if (result.body.tagsResult)
            result.body.tagsResult.values.forEach((tag) => console.log(`Tag: ${JSON.stringify(tag)}`));
    });
}
analyzeImageFromUrl();
