import { useCallback, useState } from "react"
import { FileSystemItem } from "../pages/WorkspacePage"
import { WebContainer } from "@webcontainer/api"




export const useWebContainer = async (filesystem  : FileSystemItem[]) => {
    const [webContainerStatus ,setupwebContainerStatus] = useState<{isBooted: boolean, error: string | null}>({isBooted : false , error : null}) 
    
    const setupWebContainer = useCallback(async () => {
        try {
            setupwebContainerStatus({isBooted : false , error : null}) ; 
            const webContainerInstance = await WebContainer.boot() 
            console.log("webcontainers  booted" , webContainerInstance)
            const Transformedfiles = transformToWebContainerFormat(filesystem) ; 
            await webContainerInstance.mount(Transformedfiles) 
            
            const installed = await installDependencies(webContainerInstance) ; 

            if(!installed) {
                throw new Error("files not installed")
            }

            const devProcess = await webContainerInstance.spawn('npm' , ['run' , 'dev'])
            devProcess.output.pipeTo(new WritableStream({
             write(chunk) {
               console.log("Server output :" , chunk) ;
             }
            })) 
            setupwebContainerStatus({isBooted : true , error : null})
            return true 
        } catch (error) {
            console.log("error : " , error) 
            setupwebContainerStatus({isBooted : false , error  : error as string | null })
            throw error 
        }

    } , [filesystem])


    return {setupWebContainer , webContainerStatus}  ; 


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
