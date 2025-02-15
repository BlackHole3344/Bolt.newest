import { nodeBaseprompt } from "../template/node"; 
import { reactBasePrompt , reactBasePrompt2 } from "../template/react";
import { frameType } from "../types/generalTypes";
import { GenerationResponse, LLMService , UnifiedLLM } from "../services/llm.service";









export type ModelType = "deepseek" | "anthropic" | "gemini" 

interface GenerationOptions{ 
    temperature? : number , 
    maxTokens? : number 
}

interface TemplateResponse {
    frameWork : frameType  
}

interface ModelConfig {
    deepseekAPi? : string ; 
    anthropicAPi?: string ; 
    geminiAPi? : string 
}

type Template = string 

export const getTemplate = async (llmResponse : frameType) : Promise<Template>=>{
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
         return (error as Error).message
    }
} 


export class TemplateHandler {
    private llmService : LLMService 
    private llmClient : UnifiedLLM  
    
    constructor(provider : ModelType) {
        this.llmService = LLMService.getInstance() 
        this.llmService.setProvider(provider) 
        this.llmClient = this.llmService.getClient() 
    }


    async template_api(prompt : string ) {
        try {
            const frameWork : GenerationResponse = await this.llmClient.generateTemplate(prompt) 
            return getTemplate(frameWork.FRAMEWORK) 
        } catch(error) {
            throw error 
        }
    }
    
    }


