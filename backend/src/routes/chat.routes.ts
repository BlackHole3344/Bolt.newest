import { Router, Request, Response } from 'express'; 
import { validateChatRequest } from '../middleware/validateRequest';
// import { validateTemplateRequest } from '../middleware/validateRequest';
import express from 'express';
// import { TemplateHandler } from '../controllers/templateController';
import { ChatHandler, payloadI } from '../controllers/chatController';
export const ChatRouter = express.Router();
 


ChatRouter.post('/getUpdate', validateChatRequest , async (req : Request , res: Response)=> {
  try {
    const { provider, payload } = req.body;
    const chatHandler = new ChatHandler(provider);
    const updateArtifact = await chatHandler.ChatApi(payload);
    
    res.status(200).json({ success : true , message : updateArtifact });
  } catch (error) {
    console.error('Template generation error:', error);
    res.status(500).json({
      error: 'Failed to generate template',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});
