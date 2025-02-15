import OpenAI from "openai";
import dotenv from "dotenv";
import express , { Application } from "express";
// import { frameType } from "./types/generalTypes";
import cors from "cors"
import {chat4 ,chat5} from "./testing/chatTemplate"

dotenv.config();

import { getTemplate } from "./controllers/templateController" ; 
import { TemplatePrompt } from "./defaults/SystemPrompts";
import { reactBasePrompt , reactBasePrompt2 } from "./template/react";

import { payloadI} from "./controllers/chatController";

import  {TemplateRouter} from "./routes/template.routes" 
import {ChatRouter} from "./routes/chat.routes" 


const app : Application = express(); 
app.use(express.json());

// export const AI = AI_client.gemini_client()  
// console.log("llm client initialized") 


app.use(cors({
  origin : ["http://localhost:5173"] , 
  methods : ["GET" , "POST"] ,
  allowedHeaders: ["Content-Type", "Authorization"]
}))


app.use("/api/template" , TemplateRouter) 
app.use("/api/chat" , ChatRouter) 

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 


