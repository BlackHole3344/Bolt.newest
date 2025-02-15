export interface TemplateRequest {
    provider: "deepseek" | "anthropic" | "gemini";
    prompt: string;
  }
  
  export interface ChatRequest {
    provider: "deepseek" | "anthropic" | "gemini";
    payload: {
      userprompt: string;
      artifact: string;
    };
    temperature?: number;
  }
  
  

