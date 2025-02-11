import { nodeBaseprompt } from "../template/node"; 
import { reactBasePrompt , reactBasePrompt2 } from "../template/react";
import { frameType } from "../types/generalTypes";
import { AI } from "../index"
import {TemplatePrompt} from "../defaults/SystemPrompts"
import { AiI } from "../types/generalTypes";
import { Messages } from "openai/resources/beta/threads/messages";

export const getTemplate = async (llmResponse : frameType) =>{
    try {
        switch (llmResponse) {
            case "node" : 
                return nodeBaseprompt ; 
           case "react" : 
                return reactBasePrompt2 ; 
            default : 
                return "invalid response"  
         
          }  
    } catch(error) {
         console.error("error while getting the template : " , error) 
         return error 
    }
} 


export class TemplateClass{
    static deepseekResponse  =  async (message : string) => { 
        try {
            // console.log(message)
            const result = await (AI as any).chat.completions.create({
            model : "deepseek-chat" , 
            messages : [
                    { role: "system", content: TemplatePrompt() },  
                    { role: "user", content: message }  
                ] , 
                temperature : 0 
            })  

            // console.log(result)

            const Framework = (result?.choices[0]?.message.content).toLowerCase() as frameType ; 
            console.log(Framework)
            return getTemplate(Framework) ; 
        } catch(error) {
            console.error("error :" , error) 
            throw error 
        }
    }


    static anthropicResponse = async (message : string) => {
        try {
            const result = await (AI as any).messages.create({
                model: "claude-3-5-sonnet-20241022",
                max_tokens: 1024,
                temperature : 0 ,
                messages: [  
                  { role: "user", content: message }],
                  system : TemplatePrompt()! , 
                        })
            console.log((result.content[0] as { text: string }).text);
            const answer = (result.content[0] as { text: string }).text
            const Framework = answer.toLowerCase() as frameType ; 
            const template = await getTemplate(Framework); 
            return template 
    }catch(error) {
        console.error("error : " , error) 
        throw error  
    }
}
}