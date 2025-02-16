import { useCallback, useState } from "react"
import { FileSystemItem } from '../interface/workspaceInterface'
import { WebContainer } from "@webcontainer/api"
import {InitWebContainer} from "../webcontainerAuth"





export const useWebContainer = (filesystem  : FileSystemItem[]) => {


  const [webContainerStatus ,setupwebContainerStatus] = useState<{isBooted: boolean, error: string | null}>({isBooted : false , error : null}) 
  const [url, setUrl] = useState("");
    console.log("Current webContainerStatus:", webContainerStatus); // Add this log
    const setupWebContainer = useCallback(async () => {
      console.log("SetupWebContainer function called"); 
        try {
            // const container = InitWebContainer()
            // console.log(container)
            // // setupwebContainerStatus({isBooted : false , error : null}) ;
            console.log("webContainerStatus:", webContainerStatus);  
            if (webContainerStatus.isBooted) {
              console.log("WebContainer already booted");
              return true;
            } 
        
            const wc = await WebContainer.boot() ;
            // if(!wc) {
            //    throw new Error("WebContainer failed to boot");
            // }
            console.log("webcontainers  booted" , wc)
            const Transformedfiles = await transformToWebContainerFormat(filesystem); 

            await wc.mount(Transformedfiles) 
            console.log("Files mounted")

            const installed = await installDependencies(wc);
            
            console.log("Dependencies Installed")

            if(!installed) {
                throw new Error("files not installed")
            }

            const devProcess = await wc.spawn('npm' , ['run' , 'dev'])

            console.log("app started :")

            devProcess.output.pipeTo(new WritableStream({
             write(chunk) {
               console.log("Server output :" , chunk) ;
             }

            })) 
            wc.on('server-ready', (port, url) => {
              // ...
              console.log(url)
              console.log(port)
              setUrl(url);
            })

            setupwebContainerStatus({isBooted : true , error : null})
            return true 
        } catch (error) {
            console.log("error : " , error) 
            setupwebContainerStatus({isBooted : false , error  : error instanceof(Error) ? error.message : "somthing wrong with containers setup"})
            throw error 
        }



    } , [filesystem])
    return {setupWebContainer , webContainerStatus , url}  ; 
}













 function transformToWebContainerFormat(files: FileSystemItem[]) {
    const webContainerFiles: any = {};
  
    function processItem(item: FileSystemItem): { directory?: {}; file?: { contents: {}} } {
      if (item.type === 'directory') {
        return {
          directory: item.children?.reduce((acc, child) => ({
            ...acc,
            [child.name]: processItem(child)
          }), {})
        };
      } else {
        return {
          file: {
            contents: item.content || ''
          }
        };
      }
    }
  
    // Process root level items
    files.forEach(item => {
      //// src/app.tsx or src/components  
      if (item.path.includes('/')) {
        // Handle nested paths
        const parts = item.path.split('/').filter(Boolean);
        let current = webContainerFiles; /// initially empty 
      

       /// [src , app.tsc] => slice => [src]
        parts.slice(0, -1).forEach(part => {  // [src]
          current[part] = current[part] || { directory: {} };  /// current : { src : { directory : {}} }
          current = current[part].directory; // current : {}
        });
        
        const fileName = parts[parts.length - 1];
        if (item.type === 'directory') {
          current[fileName] = processItem(item);
        } else {
          current[fileName] = {
            file: {
              contents: item.content || ''
            }
          };
        }
      } else {
        webContainerFiles[item.name] = processItem(item);
      }
    });
  
    return webContainerFiles;
  }


async function installDependencies(Instance : WebContainer){
  try {
    const installProcess = await Instance.spawn('npm' , ['install']);
    installProcess.output.pipeTo(new WritableStream({
      write(data) {
        console.log(data);
      }
    })) 
    const exit = await installProcess.exit ;
    if (exit !== 0) {
      return false ; 
    }
    return true; 
  }catch(error) {
    console.error("error :" , error) 
    throw error 
  }
}
