import OpenAI from "openai";
import dotenv from "dotenv";
import { getSystemPrompt, userprompt1, userprompt2 } from "./prompts";
import { AI_client } from "./client";
import express , { Application } from "express";
// import { frameType } from "./types/generalTypes";
import cors from "cors"
import { TemplateClass } from "./controllers/templateController";
import { ChatController } from "./controllers/chatController";
import {chat4 ,chat5} from "./testing/chatTemplate"

dotenv.config();


import { getTemplate } from "./controllers/templateController" ; 
import { TemplatePrompt } from "./defaults/SystemPrompts";
import { reactBasePrompt , reactBasePrompt2 } from "./template/react";

import { payloadI} from "./controllers/chatController";

const app : Application = express(); 
app.use(express.json());

export const AI = AI_client.anthropic_client() 
console.log("llm client initialized") 


app.use(cors({
  origin : ["http://localhost:5173"] , 
  methods : ["GET" , "POST"] ,
  allowedHeaders: ["Content-Type", "Authorization"]
}))

app.post("/template" , async (req , res) => { 
  const {messages} = req.body; 

  console.log(messages)
  try {      
  const result = await TemplateClass.anthropicResponse(messages);
  console.log(result)   
  res.status(200).json({success : true , message : result});

} catch(error) {
  console.error("error : " , error) 
  res.status(500).json({success : false , message : error})
} 
})


app.post("/test" , async (req , res) => {
  const {messages} = req.body ;
  console.log(messages) 
  res.status(200).json({success : true , message : reactBasePrompt2});
})

app.post("/test2" , async (req , res ) => {
  const {payload} = req.body; 
  // console.log(payload[0])   
  res.status(200).json({success : true , data: chat5})
} )



app.post("/chat" , async (req , res) => {
  try {
    const {payload}  = req.body;

    console.log(payload)
    const result = await ChatController.AnthropicChat(payload[0]) ; 
    res.status(200).json({success : true , data : result})
  } catch (error) {
    console.error("error : " , error) 
    throw error 
  }
})


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});



