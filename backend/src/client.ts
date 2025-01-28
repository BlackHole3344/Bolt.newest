import  OpenAI from "openai";

export function initCLient(){
    return  new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: `${process.env.DEEPSEEK_API_KEY}`
});
}




