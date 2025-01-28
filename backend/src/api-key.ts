import {env} from "node:process"; 

export function getAPIkey() {
    return env.DEEPSEEK_API_KEY ; 
}





