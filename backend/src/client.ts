import  OpenAI from "openai";
import Anthropic from '@anthropic-ai/sdk';
import dotenv from "dotenv"
import { GoogleGenerativeAI} from "@google/generative-ai";
dotenv.config() 




export class AI_client {


    static anthropic_client = () => {
        return new Anthropic({
            apiKey: `${process.env.ANTHROPIC_API_KEY}`, // defaults to process.env["ANTHROPIC_API_KEY"]
          });
    }


    
    static deepseek_client = () => {
        return  new OpenAI({
            baseURL: 'https://api.deepseek.com/v1',
            apiKey: `${process.env.DEEPSEEK_API_KEY}`
        });

    }


    static gemini_client = () => {
        const genAI = new GoogleGenerativeAI(`${process.env.GEMINI_API_KEY}`) 
        return genAI.getGenerativeModel({model : "gemini-2.0-flash" })
    }
}


