import { Request, Response, NextFunction, RequestHandler } from 'express';

interface TemplateRequest {
  provider: "deepseek" | "anthropic" | "gemini";
  prompt: string;
}

interface ChatRequest {
  provider: "deepseek" | "anthropic" | "gemini";
  payload: {
    userprompt: string;
    artifact: string;
  };
  temperature?: number;
}

export const validateTemplateRequest: RequestHandler<{}, any, TemplateRequest> = (
  req,
  res,
  next
) => {
  const { provider, prompt } = req.body;
  
  if (!provider || !prompt) {
    res.status(400).json({
      error: 'Missing required fields',
      required: ['provider', 'prompt']
    });
  }

  if (!['deepseek', 'anthropic', 'gemini'].includes(provider)) {
    res.status(400).json({
      error: 'Invalid provider',
      allowedProviders: ['deepseek', 'anthropic', 'gemini']
    });
  }

  next();
};

export const validateChatRequest: RequestHandler<{}, any, ChatRequest> = (
  req,
  res,
  next
) => {
  const { provider, payload, temperature } = req.body;

  if (!provider || !payload) {
    res.status(400).json({
      error: 'Missing required fields',
      required: ['provider', 'payload']
    });
  }

  if (!payload.userprompt || !payload.artifact) {
   res.status(400).json({
      error: 'Missing payload fields',
      required: ['userprompt', 'artifact']
    });
  }

  if (!['deepseek', 'anthropic', 'gemini'].includes(provider)) {
     res.status(400).json({
      error: 'Invalid provider',
      allowedProviders: ['deepseek', 'anthropic', 'gemini']
    });
  }

  if (temperature && (temperature < 0 || temperature > 1)) {
    res.status(400).json({
      error: 'Temperature must be between 0 and 1'
    });
  }

  next();
};