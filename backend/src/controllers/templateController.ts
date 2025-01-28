
import { nodeBaseprompt } from "../template/node"; 
import { reactBasePrompt } from "../template/react";
import { frameType } from "../types/generalTypes";









export const getTemplate = async (llmResponse : frameType) =>{
    try {
        switch (llmResponse) {
            case "node" : 
                return nodeBaseprompt ; 
           case "react" : 
                return reactBasePrompt ; 
            default : 
                return "invalid response"  
         
          }  
    } catch(error) {
         console.error("error while getting the template : " , error) 
         return error 
    }
} 