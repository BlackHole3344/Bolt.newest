// import { useState , useEffect } from "react";
// import { WebContainer } from "@webcontainer/api";


// export async function WebContainerBoot(){
//     const [webContainerState , setWebContainer] =  useState<WebContainer>() ; 
//     const main  = async() => {
//     try {
//         const WebContainerClient = await WebContainer.boot() ; 
//         setWebContainer(WebContainerClient);  
//     }catch(error) {
//         console.error("error : " , error) 
//         throw error  
//     }
//     }
//     useEffect(() => {
//         main()
//     } , [])

//     return webContainerState ; 
// }