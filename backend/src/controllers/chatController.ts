
export interface payloadI {
    id : number , 
    prompt? : string , 
    artifact? : string 
}
// type payloadType = keyof payload ; 
import { AI } from "../index";
import { getSystemPrompt } from "../prompts";

export class ChatController {
static deepSeekChat = async (payload: payloadI ) => {
      try {
        
        const userprompt = payload.prompt ; 
        const artifact =  (payload.artifact)?.toString();  
        const result = await (AI as any).chat.completions.create({
            model: "deepseek-chat",
            messages: [
                { role: "system", content: getSystemPrompt() },
                { role: "user", content: `The following is a list of all project files and their complete contents that are currently visible and accessible to you
                ${artifact} Here is a list of files that exist on the file system but are not being shown to you:  - .gitignore  - 
                package-lock.json  - .bolt/prompt, For all designs I ask you to make, have them be beautiful, not cookie cutter. Make webpages that are fully featured and worthy for production.\n\nBy default, 
                this template supports JSX syntax with Tailwind CSS classes, React hooks, and Lucide React for icons. Do not install other packages for UI themes, icons, etc
                unless absolutely necessary or I request them.\n\nUse icons from lucide-react for logos.\n\nUse stock photos from unsplash where appropriate, only valid URLs
                you know exist. Do not download the images, only link to them in image tags. just start the response with ill create and add some details about project at beginning only` },
                { role: "user", content: userprompt }
            ],
            temperature: 0
        });

        console.log("result : " ,result?.choices[0]?.message.content)
        const data = result?.choices[0]?.message.content 
        return data 
    } catch(error) {
        console.error("error : " , error) 
        throw error 
    }
}
static AnthropicChat = async (payload: payloadI) => {
    try {
        const userprompt = payload.prompt ; 
        const artifact =  (payload.artifact)?.toString();  

        const result = await (AI as any).messages.create({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 3000,
            temperature : 0 ,
            messages: [  
              { role: "user", content: `The following is a list of all project files and their complete contents that are currently visible and accessible to you
                ${artifact} .  - .gitignore  - 
                package-lock.json  - .bolt/prompt, Here is a list of files that exist on the file system but are not being shown to you:  For all designs I ask you to make, have them be beautiful, not cookie cutter. Make webpages that are fully featured and worthy for production.\n\nBy default, 
                this template supports JSX syntax with Tailwind CSS classes, React hooks, and Lucide React for icons. Do not install other packages for UI themes, icons, etc
                unless absolutely necessary or I request them.\n\nUse icons from lucide-react for logos.\n\nUse stock photos from unsplash where appropriate, only valid URLs
                you know exist. Do not download the images, only link to them in image tags. just start the response with ill create and add some details about project at beginning onlyAdditional Guidelines:
                - Keep responses within 3000 tokens to ensure optimal processing
                - Focus on modern, clean designs that prioritize user experience
               Routing and Navigation Requirements:
- Always implement a proper routing setup using react-router-dom
- Create a Routes component in App.tsx wrapping all routes
- Define all routes at the top level of the application
- Always include an index/home route ('/')
- Implement a 404 Not Found page for undefined routes
- Use proper nested routing when needed
- Ensure navbar links use <Link> or <NavLink> components
- Add active state styling for current route in navigation
- Handle route parameters properly when needed
- Implement route guards if authentication is required
- Keep route definitions clean and organized
- Use proper route naming conventions
- Include loading states during route transitions
- Maintain proper browser history
- Handle back/forward navigation gracefully

Example Route Structure:
tsx
const router = createBrowserRouter([
  {
    path: "/",
    element: ,
    errorElement: ,
    children: [
      { index: true, element:  },
      { path: "about", element:  },
      // Add other routes as needed
    ]
  }
]);
`} ,
            {role : "user" , content : userprompt}],
              system : getSystemPrompt()!, 
            })
    const data = (result.content[0] as { text: string }).text
    return data 
    } catch(error) {
        console.error("error : " , error) 
        throw error 
    }
}












}