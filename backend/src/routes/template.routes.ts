import { Router, Request, Response } from 'express'; 
import { validateChatRequest } from '../middleware/validateRequest';
import { validateTemplateRequest } from '../middleware/validateRequest';
import express from 'express';
import { TemplateHandler } from '../controllers/templateController';
// import { Express } from 'express';
export const TemplateRouter = express.Router();

interface TemplateRequest {
    provider: "deepseek" | "anthropic" | "gemini";
    prompt: string;
} 
TemplateRouter.post('/getTemplate', validateTemplateRequest , async (req : Request< {} ,{} , TemplateRequest> , res: Response)=> {
  try {
    const { provider, prompt } = req.body;
    // console.log(req.body) 
    const templateHandler = new TemplateHandler(provider);
    const template = await templateHandler.template_api(prompt);

    res.status(200).json({ success : true , message : template });
  } catch (error) {
    console.error('Template generation error:', error);
    res.status(500).json({
      error: 'Failed to generate template',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});
