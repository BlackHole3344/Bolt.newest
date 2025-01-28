import OpenAI from "openai";
import dotenv from "dotenv";
import { getSystemPrompt, userprompt1, userprompt2 } from "./prompts";
import { initCLient } from "./client";
import express , { Application } from "express";
import { frameType } from "./types/generalTypes";




dotenv.config();
console.log(process.env.DEEPSEEK_API_KEY);

import { getTemplate } from "./controllers/templateController" ; 


const app : Application = express(); 
app.use(express.json());
const openai = initCLient() 
console.log("deepseek client initialized") 

app.post("/template" , async (req , res) => { 
  const {messages} = req.body?.prompt ; 
        
  const result = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [{
          role: "system",
          content: `you should only reply in a single word , user will give a prompt 
          about creating a app , please only answer whether its a react or node project nothing else 
          example : 
          prompt : create a simple portfolio website 
          answer : react`
      }, {
          role: "user",
          content: messages
      }] , 
      max_tokens : 1 , 
      temperature :0 

  });

  if(!result?.choices?.[0]?.message?.content) {
    res.status(500).json({success : false , message : "llm doesnt respond"})
  } 
  const Framework = result.choices[0]?.message.content?.toLowerCase() as frameType ; 
  const template = await getTemplate(Framework); 
  res.status(200).json({success : true , answer : template}); 
})

app.post("/chat" , async (req , res) => {
   const {payload , userPrompt} = req.body ; 
   const stream = await openai.chat.completions.create({
    model: "deepseek-chat",
    messages: [
      { role: "system", content: getSystemPrompt()},
      { role: "user", content: 
        `The following is a list of all project files and their complete contents that are currently visible and accessible to you
        ${payload} Here is a list of files that exist on the file system but are not being shown to you:  - .gitignore  - 
        package-lock.json  - .bolt/prompt, For all designs I ask you to make, have them be beautiful, not cookie cutter. Make webpages that are fully featured and worthy for production.\n\nBy default, 
       this template supports JSX syntax with Tailwind CSS classes, React hooks, and Lucide React for icons. Do not install other packages for UI themes, icons, etc
       unless absolutely necessary or I request them.\n\nUse icons from lucide-react for logos.\n\nUse stock photos from unsplash where appropriate, only valid URLs
        you know exist. Do not download the images, only link to them in image tags. just start the response with ill create and add some details about project at beginning only`} ,
      {role : "user" , content :  userPrompt}
    ],
    stream: true , 
    max_tokens : 2000 , 
    temperature : 0 
  });

  let buffer = "";
  let response = ""
  for await (const chunk of stream) {
    buffer += chunk.choices[0]?.delta?.content || ' ';
    response += chunk.choices[0]?.delta?.content || ' ';
    if (buffer.includes("\n") || buffer.length >= 100) {
      console.log(buffer);
      buffer = "";
    }
  }
  res.status(200).json({response})
})









const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});




async function main() {
  const stream = await openai.chat.completions.create({
    model: "deepseek-chat",
    messages: [
      { role: "system", content: getSystemPrompt() },
      { role: "user", content: "create a todo app in react" },
      { role: "user", content: userprompt1 },
      { role: "user", content: userprompt2 }
    ],
    stream: true
  });

  let buffer = "";
  for await (const chunk of stream) {
    buffer += chunk.choices[0]?.delta?.content || ' ';
    if (buffer.includes("\n") || buffer.length >= 100) {
      console.log(buffer);
      buffer = "";
    }
  }
}

