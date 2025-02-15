import dotenv from "dotenv"
import { GoogleGenerativeAI } from "@google/generative-ai"
import OpenAI from "openai"
import Anthropic from '@anthropic-ai/sdk';
import {TemplatePrompt} from "../defaults/SystemPrompts"
import { frameType } from "../types/generalTypes";
// import { getTemplate} from "../controllers/templateController";
import { payloadI } from "../controllers/chatController";
import { ModelType } from "../controllers/templateController"; 
import { GenerationinstructPrompt, getSystemPrompt } from "../prompts";
import { getchatTemplate } from "../testing/chatTemplate";
dotenv.config()

interface LLMConfig {
  deepseekKey?: string
  AnthropicKey?: string
  geminiKey?: string
  defaultProvider: "deepseek" | "anthropic" | "gemini"
}

export interface LLMchat {
  artifact : string
  description : string  

}



const getLLMConfig = (): LLMConfig => ({
  deepseekKey: `${process.env.DEEPSEEK_API_KEY}`,
  AnthropicKey: `${process.env.ANTHROPIC_API_KEY}`,
  geminiKey: `${process.env.GEMINI_API_KEY}`,
  defaultProvider: `${process.env.DEEPSEEK_API_KEY}` as "deepseek" 
})

interface GenerationOptions {

  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

interface GenerationResponse {
  FRAMEWORK : frameType 
}

class UnifiedLLM {
  private deepseek?: OpenAI
  private anthropic?: Anthropic
  private gemini?: GoogleGenerativeAI
  private currentProvider: "deepseek" | "anthropic" | "gemini" 

  constructor(config: LLMConfig) {
    if (config.AnthropicKey) {
      this.anthropic = new Anthropic({
        apiKey: config.AnthropicKey,
      });
    }

    if (config.deepseekKey) {
      this.deepseek = new OpenAI({
        baseURL: 'https://api.deepseek.com/v1',
        apiKey: config.deepseekKey
      });
    }

    if (config.geminiKey) {
      this.gemini = new GoogleGenerativeAI(config.geminiKey);
    }

    this.currentProvider = config.defaultProvider;
  }


    private validateFrameworkType(text: string): frameType {
            // Convert to lowercase and remove any whitespace
            const normalizedText = text.toLowerCase().trim();
            
            switch (normalizedText) {
              case 'react':
                return 'react';
              case 'node':
                return 'node';
              case 'nextjs':
                return 'nextjs';
              default:
                throw new Error(`Invalid framework type: ${text}. Expected 'react', 'node', or 'nextjs'`);
            }
          } 

    // private validateProvider(provider : ModelType) {
    //   if (this.currentProvider != provider) {
    //     throw new Error("LLM is not intialized") 
    //   } 

    // }      

  async generateTemplate(prompt: string, options: GenerationOptions = {}): Promise<GenerationResponse> {
    switch (this.currentProvider) {
      case 'deepseek':
        if (!this.deepseek) throw new Error('Deepseek client not initialized');
        const deepseekResponse = await this.deepseek.chat.completions.create({
          model: 'deepseek-chat',
          messages: [
            {role : "system" , content : TemplatePrompt()}, 
            { role: 'user', content: prompt }
          ],
          temperature: options.temperature || 0,
          max_tokens: options.maxTokens,
        });

        if(!deepseekResponse?.choices[0]?.message.content) {
          throw new Error('Cannot able to fetch response from llm')
        } 
        const res = deepseekResponse?.choices[0]?.message.content

        const DeepseekFramework = this.validateFrameworkType(res)

        return {FRAMEWORK : DeepseekFramework } 



      case 'anthropic':
        if (!this.anthropic) throw new Error('Anthropic client not initialized');
        const anthropicResponse = await this.anthropic!.messages.create({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 1024,
          temperature : 0 ,
          messages: [  
            { role: "user", content: prompt}] ,
            system : TemplatePrompt()! , 
         })
        const answer = (anthropicResponse.content[0] as { text: string }).text
        const AnthropicFramework = this.validateFrameworkType(answer) 
        return {FRAMEWORK : AnthropicFramework}                     
   
      case 'gemini':
        if (!this.gemini) throw new Error('Gemini client not initialized');
        const model = this.gemini.getGenerativeModel({ 
          model: 'gemini-2.0-flash-001',
        });

        const fullPrompt =`${TemplatePrompt()}\n\nUser: ${prompt}`
          
        const geminiResponse = await model.generateContent(fullPrompt);
        const GeminiFramework = this.validateFrameworkType(geminiResponse.response.text()) 
        return {FRAMEWORK : GeminiFramework} ; 


      default:
        throw new Error(`Unsupported provider: ${this.currentProvider}`);
    }
  } 
  


  async generateUpdate(payload : payloadI , options : GenerationOptions = {} ) {
    const userprompt = payload.userprompt ; 
    const artifact =  (payload.artifact)?.toString(); 
    if(!userprompt || !artifact) {
      throw new Error("user prompt and artifact is required")
    }

    switch (this.currentProvider){
      case "deepseek":  
          if(!this.deepseek) throw new Error("Deepseek Client is not initialized")  
          try {
          console.log("Processing Deepseek request")
          const deepseekResponse = await this.deepseek.chat.completions.create({
            model: 'deepseek-chat',
            messages: [
              {role : "system" , content : getSystemPrompt()}, 
              {role: 'user', content: await getchatTemplate(artifact!) }, 
              {role  :"user" , content : userprompt!} 
            ],
            temperature: 0,
            max_tokens: options.maxTokens,
          });
           
          if(!deepseekResponse.choices[0]) {
            throw new Error("can't fetched response from deepseek") 
          }
          console.log("tokens used : " , deepseekResponse.usage?.total_tokens)
          const Deepseekdata = deepseekResponse.choices[0].message.content  
          return Deepseekdata 
        } catch(error) {
          throw error 
        } 

    case "anthropic" : 
        if(!this.anthropic) throw new Error("Anthropic client is not initialized");
        try {
        console.log("Processing Anthropic request") 
        const AnthropicResponse = await this.anthropic.messages.create({
                   model: "claude-3-5-sonnet-20241022",
                    max_tokens: 3000,
                    temperature : 0 ,
                    messages: [  
                      { role: "user", content: await getchatTemplate(artifact!)},
                      {role : "user" , content : userprompt!}],
                      system : getSystemPrompt()!, 
                    })
            if(!AnthropicResponse.content[0]){
              throw new Error("can't fetched response from Anthropic") 
            } 
            console.log("got Anthropic response" , AnthropicResponse.usage.output_tokens)
            const Anthropicdata = (AnthropicResponse.content[0] as { text: string }).text
            return Anthropicdata 
        }catch(error) {
          throw error  
        } 

  case "gemini" : 
      if(!this.gemini) throw new Error("Gemini client is not initialized") 
      try {
        const model = this.gemini.getGenerativeModel({ 
          model: "gemini-2.0-flash",
        });

        const fullPrompt = `\nSystem : ${getSystemPrompt()}\n${GenerationinstructPrompt()}\nUser: ${await getchatTemplate(artifact!)}\n\nUser: ${userprompt}`
        console.log("Processing gemini request")   
        const geminiResponse = await model.generateContent(fullPrompt);
        console.log("got Gemini response" , geminiResponse.response.usageMetadata?.totalTokenCount)  
        if(!geminiResponse.response.text()) {
          throw new Error("can't fetched response from gemini")  
        } 
        const GeminiData = geminiResponse.response.text() 
        return GeminiData 
      } catch(error) {
        throw error       
      }
      
    
    default : 
        throw new Error("Invalid provider")
    } 
  }

  setProvider(provider: "deepseek" | "anthropic" | "gemini") {
    this.currentProvider = provider;
  }

  getCurrentProvider() {
    return this.currentProvider;
  }
}






class LLMService {
  private static instance: LLMService;
  private llmClient: UnifiedLLM;
  private currentProvider: "deepseek" | "anthropic" | "gemini";

  private constructor() {
    const config = getLLMConfig();
    this.llmClient = new UnifiedLLM(config);
    this.currentProvider = config.defaultProvider;
  }

  public static getInstance(): LLMService {
    if (!LLMService.instance) {
      LLMService.instance = new LLMService();
    }
    return LLMService.instance;
  }

  public getClient(): UnifiedLLM {
    return this.llmClient;
  }

  public setProvider(provider: "deepseek" | "anthropic" | "gemini") {
    this.currentProvider = provider;
    this.llmClient.setProvider(provider);

  }

  public getCurrentProvider(): string {
    return this.currentProvider;
  }

  public async generateTemplate(prompt: string, options: GenerationOptions = {}): Promise<GenerationResponse> {
    try {
      return await this.llmClient.generateTemplate(prompt, options);
    } catch (error) {
      console.error(`Error with provider ${this.currentProvider}:`, error);
      // if current provider fails, try falling back to default provider
      if (this.currentProvider !== getLLMConfig().defaultProvider) {
        this.setProvider(getLLMConfig().defaultProvider);
        return await this.llmClient.generateTemplate(prompt, options);
      }
      throw error;
    }
  }
}

export { LLMService, UnifiedLLM, type GenerationOptions, type GenerationResponse };