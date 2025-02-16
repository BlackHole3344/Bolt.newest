export interface payloadI {
    prompt? : string , 
    artifact? : string 
}
// type payloadType = keyof payload ; 

import { LLMService } from "../services/llm.service"
import { UnifiedLLM } from "../services/llm.service"
import { ModelType } from "./templateController" 


export class ChatHandler {
  private llmService : LLMService 
  private llmClient : UnifiedLLM  
  
  constructor(provider : ModelType ) {
      this.llmService = LLMService.getInstance() 
      this.llmService.setProvider(provider) 
      this.llmClient = this.llmService.getClient() 
  }
  async ChatApi(payload : payloadI) { 
    try {
        const updateData = await this.llmClient.generateUpdate(payload)   
        return updateData 
    } catch(error) {
        throw error 
    }
  }

}

// export class ChatController {
// static deepSeekChat = async (payload: payloadI ) => {
//       try {
        
//         const userprompt = payload.prompt ; 
//         const artifact =  (payload.artifact)?.toString();  
//         const result = await (AI as any).chat.completions.create({
//             model: "deepseek-chat",
//             messages: [
//                 { role: "system", content: getSystemPrompt() },
//                 { role: "user", content: `The following is a list of all project files and their complete contents that are currently visible and accessible to you
//                 ${artifact} Here is a list of files that exist on the file system but are not being shown to you:  - .gitignore  - 
//                 package-lock.json  - .bolt/prompt, For all designs I ask you to make, have them be beautiful, not cookie cutter. Make webpages that are fully featured and worthy for production.\n\nBy default, 
//                 this template supports JSX syntax with Tailwind CSS classes, React hooks, and Lucide React for icons. Do not install other packages for UI themes, icons, etc
//                 unless absolutely necessary or I request them.\n\nUse icons from lucide-react for logos.\n\nUse stock photos from unsplash where appropriate, only valid URLs
//                 you know exist. Do not download the images, only link to them in image tags. just start the response with ill create and add some details about project at beginning only` },
//                 { role: "user", content: userprompt }
//             ],
//             temperature: 0
//         });

//         console.log("result : " ,result?.choices[0]?.message.content)
//         const data = result?.choices[0]?.message.content 
//         return data 
//     } catch(error) {
//         console.error("error : " , error) 
//         throw error 
//     }
// }
// static AnthropicChat = async (payload: payloadI) => {
//     try {
//         const userprompt = payload.prompt ; 
//         const artifact =  (payload.artifact)?.toString();  

//         const result = await (AI as any).messages.create({
//            model: "claude-3-5-sonnet-20241022",
//             max_tokens: 3000,
//             temperature : 0 ,
//             messages: [  
//               { role: "user", content: },
//             {role : "user" , content : userprompt}],
//               system : getSystemPrompt()!, 
//             })
//     const data = (result.content[0] as { text: string }).text
//     return data 
//     } catch(error) {
//         console.error("error : " , error) 
//         throw error 
//     }
// }
// }