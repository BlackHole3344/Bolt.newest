
/** @type {import('@webcontainer/api').WebContainer}  */
import { useWebContainer } from '../hooks/WebContainerLoad'; 
// import { WebContainer } from '@webcontainer/api';
import React, { useState, useEffect , useRef , useCallback} from 'react';
// import { NodeJS } from 'node';
import { useLocation } from 'react-router-dom';
import { MessageSquare,  X, Moon, Sun, ChevronRight, Signal } from 'lucide-react';
import { Loader2, Send } from 'lucide-react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import {  parseTemplateToProject } from '../xmlparser';
import { Step, StepType } from '../types/artifact';
import { Folder, FileCode2, FileType, FileText } from 'lucide-react';
import {  Code, Sparkles } from 'lucide-react';
/////Hooks/////////////////
// import {WebContainerBoot} from "../hooks/WebContainerBoot"
 


interface FileContent {
  name: string;
  content: string;
  language: string;
  path: string;
}

export interface FileSystemItem {
  name: string;
  type: 'file' | 'directory';
  children?: FileSystemItem[];
  content?: string;
  language?: string;
  path: string;
}



export interface Payload{
  id : number ,
  prompt? : string ,   
  artifact? : string , 
  FileSys? : FileSystemItem     
}

interface TabItem {
  file: FileContent;
  id: string;
}

interface ParsedContent {
  START_DESCRIPTION : string;
  artifact : string 
  END_DESCRIPTION : string 
}

interface Descriptions{
  id : number 
  text : string 
}

interface ChatItem {
  id : number 
  chat : string 
}


interface FileExplorerProps {
  fileSystem: FileSystemItem[];
  onFileSelect: (file: FileContent) => void;
}

// File Explorer Component
const FileExplorer: React.FC<FileExplorerProps> = ({ fileSystem, onFileSelect }) : JSX.Element => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['/src']));

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const renderItem = (item: FileSystemItem, level: number = 0) => {
    const isExpanded = expandedFolders.has(item.path);
    const paddingLeft = level * 16;

    if (item.type === 'directory') {
      return (
        <div key={item.path.split("/")[1]}>
          <div
            onClick={() => toggleFolder(item.path)}
            className="flex items-center space-x-2 p-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50"
            style={{ paddingLeft: `${paddingLeft}px` }}
          >
            <ChevronRight
              className={`w-4 h-4 text-gray-500 transition-transform ${
                isExpanded ? 'transform rotate-90' : ''
              }`}
            />
            <Folder className="w-4 h-4 text-yellow-500" />
            <span className="text-sm text-gray-700 dark:text-gray-300">{item.name}</span>
          </div>
          {isExpanded && item.children && (
            <div>
              {item.children.map(child => renderItem(child, level + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <div
        key={item.path}
        onClick={() => item.content && item.language && onFileSelect({
          name: item.name,
          content: item.content,
          language: item.language,
          path: item.path
        })}
        className="flex items-center space-x-2 p-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50"
        style={{ paddingLeft: `${paddingLeft + 24}px` }}
      >
        {item.name.endsWith('.jsx') || item.name.endsWith('.tsx') ? (
          <FileCode2 className="w-4 h-4 text-blue-500" />
        ) : item.name.endsWith('.css') ? (
          <FileType className="w-4 h-4 text-purple-500" />
        ) : (
          <FileText className="w-4 h-4 text-gray-500" />
        )}
        <span className="text-sm text-gray-700 dark:text-gray-300">{item.name}</span>
      </div>
    );
  };

  return (
    <div className="p-4">
      <div className="mb-4 text-lg font-semibold text-gray-700 dark:text-gray-300">
        Files
      </div>
      <div className="space-y-1">
        {fileSystem.map(item => renderItem(item))}
      </div>
    </div>
  );
};

// Tab Bar Component , tabs 
const TabBar: React.FC<{
  tabs: TabItem[];
  activeTab: string;
  onTabClick: (id: string) => void;
  onTabClose: (id: string) => void;
}> = ({ tabs, activeTab, onTabClick, onTabClose }) => {
  return (
    <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-700">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={`flex items-center px-4 py-2 border-r border-gray-200 dark:border-gray-700 cursor-pointer ${
            activeTab === tab.id
              ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400'
              : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
          }`}
        >
          <span onClick={() => onTabClick(tab.id)}>{tab.file.name}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTabClose(tab.id);
            }}
            className="ml-2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default function WorkspacePage() {
  const location = useLocation();
  const [activeView , setActiveView] = useState<'code' | 'preview'>('code');
  const [openTabs, setOpenTabs] = useState<TabItem[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' ||
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  const [payloaditems , setPayload ] = useState<Payload[]>([]) ; 
  // const initialized = useRef(false);
  
  
  
  const initialPrompt = location.state?.prompt || 'No prompt provided';
  const [Chats , setChats] = useState<ChatItem[]>([{id : 1 , chat : initialPrompt}])

 ///// Progress panel thing 
  const [steps , setSteps] = useState<Step[]>([]);
  ////File explorar panel thing 
  const [fileSystem, setFileSystem] = useState<FileSystemItem[]>([
  ]);



  /////// finds a file in entire filesystem array 
  const findFileInSystem = (items: FileSystemItem[], targetPath: string): FileSystemItem | undefined => {
    for (const item of items) {
      if (item.path === targetPath) return item;
      if (item.children) {
        const found = findFileInSystem(item.children, targetPath);
        if (found) return found;
      }
    }
    return undefined
  };

 
  const getHTMLContent = () => {
    if (activeView !== 'preview') return '';
    const indexHTML = findFileInSystem(fileSystem, '/public/index.html');
    return indexHTML?.content || '';
  };


  /////handles on click logic for files 
  const handleFileSelect = (file : FileContent) => {
    setActiveView('code');
    // update step status when file is opened 
    // updateStepStatus(file.path);   
    const existingTab = openTabs.find(tab => tab.file.path === file.path);
    if (existingTab) {
      setActiveTabId(existingTab.id);
    } else {
      const newTab = { file, id: `tab-${Date.now()}`};
      setOpenTabs([...openTabs, newTab]);
      setActiveTabId(newTab.id);
    }
  };

  const handleTabClose = (tabId: string) => {
    setOpenTabs(openTabs.filter(tab => tab.id !== tabId));
    if (activeTabId === tabId) {
      setActiveTabId(openTabs[openTabs.length - 2]?.id || null);
    }
  };

  // const handleTabsClosed = (tabID : string ) => {
  //   const activeExistingTab = openTabs.filter(tab => tab.id === tabId); 

  // }

  //// updates the code for generation updates from llm 
  const updateFileContent = (path: string, newContent: string) => {
    setFileSystem(prev => {
      const updateFileInTree = (items: FileSystemItem[]): FileSystemItem[] => {
        return items.map(item => {
          if (item.path === path) {
            return { ...item, content: newContent };
          }
          if (item.type === 'directory' && item.children) {
            return {
              ...item,
              children: updateFileInTree(item.children)
            };
          }
          return item;
        });
      };
      
      return updateFileInTree(prev);
    });
  };
////// edits the content inside files when there is a editor change in monaco 
  const handleEditorChange = (value: string | undefined, tabId: string) => {
    if (!value) return;
    setOpenTabs(tabs =>
      tabs.map(tab =>
        tab.id === tabId
          ? { ...tab, file: { ...tab.file, content: value } }
          : tab
      )
    );
    const tab = openTabs.find(t => t.id === tabId);
    if (tab) {
      updateFileContent(tab.file.path, value); /// updates the file content 
      // Update step status when file is edited
      // updateStepStatus(tab.file.path);
    }
  };

  ////////// Separates : description and artifact from generation update 
  function parseContent(input: string): ParsedContent {
    // Initialize result object
    const result: ParsedContent = {
      START_DESCRIPTION : '',
      artifact: '',
      END_DESCRIPTION : '' 
    };
  
    // extracts description (everything before first <boltArtifact>)
    const STARTdesMatch = input.match(/^([\s\S]*?)(?=<boltArtifact|$)/);
    result.START_DESCRIPTION = STARTdesMatch ? STARTdesMatch[1].trim() : '';
  
    // extracts complete artifact content including tags
    // </boltArtifact>
    const artifactRegex = /(<boltArtifact[\s\S]*?<\/boltArtifact>)/;
    const artifactMatch = artifactRegex.exec(input);
   
    const ENDdesRegex = /<\/boltArtifact>\s*([\s\S]*?)(?=<boltAction|$)/;
    const ENDdesMatch = input.match(ENDdesRegex); 
    result.END_DESCRIPTION = ENDdesMatch ? ENDdesMatch[1].trim() : '';
    if (artifactMatch && artifactMatch[1]) {
      result.artifact = artifactMatch[1].trim();
    }
  
    return result;
  }
  
  // Helper function to validate parsed content
  const [updatePhase, setUpdatePhase] = useState<'idle' | 'initial' |  'mounting' | 'updated'| 'Done'>('idle');

  const controllerRef = useRef<AbortController | null>(null); ///// hook which persist across every re-render , either it can hold AbortController or null 
   ////// triggered whenever page is loaded (1st event)
  useEffect(() => {
    // if (!initialized.current) {
    //   initialized.current = true;
    //   init();
    // }
    //////
    controllerRef.current = new AbortController(); //// setting current value to AbortController 
    init(controllerRef.current.signal); /// when init is done , in callback we just set the  signal to abort and axios throws error 
  return () => {
    controllerRef.current?.abort();
  };
  }, []); //// runs on [] event (every reload )
  


////////issue./////"prevent init running everytime on reload/////////////
 const init = async (signal: AbortSignal)  => {
  if(updatePhase !== "idle") return ; 
    try {

    console.log("payload : " , Chats) 
    const response = await axios.post(`http://localhost:3000/test`, { messages : Chats.filter(chat => chat.id == 1)} , 
    { signal : signal } )
    // console.log("request") 
    if(!response) {
      console.log("no response")
    } 
    const {message} = response.data; 
    // console.log(parseTemplateToProject(message))
  ////////parseTemplateToProject(xmlparser) return Step[]  
   setSteps(parseTemplateToProject(message).steps.map((x : Step) => ({
      ...x , 
      status : "loading" //// default sets it to loading 
    }))  
  )
  setUpdatePhase("initial")    
  } catch (error) {
    console.error("Init error:", error);
    setUpdatePhase('idle');
  }
  }


  //////////////STEP-3-REQUEST-GENERATION-FILES////////////////////////////////////////
  useEffect(() => {
    // if(status === 'updated') return ; 
    if(updatePhase !== 'updated') return;
    // if(updatePhase === 'Done') return ;  
    const getUpdates = async (signal : AbortSignal) => {
      try {
        const { data } = await axios.post(`http://localhost:3000/test2` , {
      payload : payloaditems 
        } , { signal});
        // if (!mounted) return;  
        console.log(data) 
        const parsed = parseContent(data.data);

        const newDescriptions : Descriptions[] = [
          {id : description.length + 1 , text : parsed.START_DESCRIPTION } ,
          {id : description.length + 2 , text : parsed.END_DESCRIPTION }
        ] 

        handleDescriptions(newDescriptions)

  
        const newSteps = parseTemplateToProject(parsed.artifact).steps;
        // console.log(newSteps) 
        // Only update if there are actual changes
        setSteps(prevSteps => {
          const hasChanges = newSteps.some(newStep => {
            const existing = prevSteps.find(s => s.title === newStep.title);
            return !existing || existing.code !== newStep.code;
          });
  
          if (!hasChanges) return prevSteps;
  
          const stepMap = new Map(prevSteps.map(step => [step.title, step]));
          

          newSteps.forEach(newStep => {
            if (stepMap.has(newStep.title)) {
              const existing = stepMap.get(newStep.title)!;
              if (existing.code !== newStep.code) {
                existing.code = newStep.code;
                existing.status = "loading";
              }
            } else {
              stepMap.set(newStep.title, { ...newStep, status: "loading" });
            }
          });
        // setStatus('updating');
        setUpdatePhase("updated") 
        return hasChanges ? Array.from(stepMap.values()) : prevSteps;
        });
      } catch (error) {
        console.error("Update error:", error);
      }
    };
    setTimeout( () => {
      controllerRef.current = new AbortController();
      getUpdates(controllerRef.current.signal)
      console.log(fileSystem)
    } , 3000)
    
    return () => {
    };

  }, [fileSystem]);


  ///// Doubtful about is it working fine or not 
  ///////////////////////////FILE-SETUP\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
  useEffect(() => {
    // Only process if we have steps
    if(updatePhase === "Done" || updatePhase === "idle") return; 
    if (!steps.length) return;
    console.log(steps.length) 
    const updateFileSystem = async () => {
      // const updatedSteps = new Set();
      setFileSystem(prevFileSystem => {
        const newFileSystem = [...prevFileSystem];
        const processedSteps = new Set();
        //  const pendingSteps = steps.filter(
        //   step => step.status === "waiting" || step.status === "loading" 
        //  )
         const addToDirectory = (item: FileSystemItem, parentPath: string = '') => {
          const pathParts = item.path.split('/').filter(Boolean).filter(x => x.trim()); ///removes empty strings , further strip the empty spaces returns a array 
          let currentPath = ''; 
          let currentSystem = newFileSystem;
  
          // navigate through path parts to find/create parent directories
          for (let i = 0; i < pathParts.length - 1; i++) { /// 
            currentPath += '/' + pathParts[i]; /// creating a path 
            let dir = findFileInSystem(newFileSystem, currentPath);
  
            if (!dir) {
              // Create missing directory
              dir = {
                name: pathParts[i],
                type: 'directory',
                path: currentPath,
                children: []
              };
              currentSystem.push(dir);
            }
  
            if (dir.type === 'directory') {
              currentSystem = dir.children || [];
              dir.children = currentSystem;
            }
          }
  
          // add the actual item to its parent directory
          if (pathParts.length > 1) {
            currentSystem.push(item);
          } else {
            // root level items
            newFileSystem.push(item);
          }
        };

        steps.forEach(step => {

          if (step.status === "waiting" || step.status === "loading") { 

          let newItem: FileSystemItem ; 


          switch (step.type) {
            case StepType.CreateFile: {
              const pathArray = step.title.split("/")
               newItem = {
                // name: (step.title.split("/").length > 1) ? step.title.split("/")[-1] : step.title,
                name: pathArray[pathArray.length - 1],
                type: "file",
                path: `/${step.title}`,
                content: step.code || '',
                language: step.title.endsWith('.js') ? 'javascript' 
                  : step.title.endsWith('.ts') ? 'typescript'
                  : step.title.endsWith('.css') ? 'css'
                  : step.title.endsWith('.html') ? 'html'
                  : 'plaintext'
              };
              
              const existingFile = findFileInSystem(newFileSystem, `/${step.title}`);
            if (existingFile) {
              existingFile.content = step.code || existingFile.content;
            } else {
              addToDirectory(newItem);
            }
            processedSteps.add(step.title);
          
            }

 
            case StepType.CreateFolder: 
            const pathArray = step.title.split("/")

                newItem = {
                  name: pathArray[pathArray.length - 1],
                  type: "directory",
                  path: `/${step.title}`, // You might want to adjust the path based on your needs
                  children: []
                };
                if (!findFileInSystem(newFileSystem, newItem.path)) {
                  addToDirectory(newItem);
                }
                break;


            ////issue here 
            case StepType.EditFile:
              const existingFile = findFileInSystem(newFileSystem ,`/${step.title}`); 
              if (existingFile && existingFile.type === 'file') {
                existingFile.content = step.code || existingFile.content; /// overwrites the code inside file 
                return newFileSystem ; 
              }

              return newFileSystem 
            
            case StepType.DeleteFile : 
              const pathParts = step.title.split('/').filter(Boolean);
              if (pathParts.length > 1) {
                const parentPath = '/' + pathParts.slice(0, -1).join('/');
                const parentDir = findFileInSystem(newFileSystem, parentPath);
                if (parentDir && parentDir.type === 'directory' && parentDir.children) {
                  parentDir.children = parentDir.children.filter(
                    child => child.path !== `/${step.title}`
                  );
                }
              } else {
                const fileIndex = newFileSystem.findIndex(
                  item => item.path === `/${step.title}`
                );
                if (fileIndex !== -1) {
                  newFileSystem.splice(fileIndex, 1);
                }
              }
              break;
            case StepType.RunScript : 
                return newFileSystem ;    

            default : 
              return newFileSystem
            };
          }
        });
        if (processedSteps.size > 0) {
          Promise.resolve().then(() => {
            setSteps(prev => prev.map(step => ({
              ...step,
              status: processedSteps.has(step.title) ? "completed" : step.status
            })));
            
          });
        }
        if(updatePhase == "initial") {
          setUpdatePhase("updated") 
        }else {
          setUpdatePhase("Done")
        }
        return newFileSystem;
      });
      // setIsMounting(false);
    };
    // console.log(FileSystem) 
    setTimeout(() => {
    updateFileSystem(); 
  } , 3000)  
    console.log("filesystem : " ,fileSystem)
  }, [updatePhase]);



  
const { setupWebContainer , webContainerStatus , url}  = useWebContainer(fileSystem); 
console.log(webContainerStatus) 

//////////////WEB-CONTAINER///////////////
useEffect(() => {
  if(activeView !=="preview") return ; 
  console.log("Effect running with:", {
    updatePhase,
    isBooted: webContainerStatus.isBooted
  });

  if (updatePhase === "Done" && !webContainerStatus.isBooted) {
    console.log("Conditions met, calling setupWebContainer");
    setupWebContainer();
  } else {
    console.log("Conditions not met:", {
      updatePhaseIsDone: updatePhase === "Done",
      isNotBooted: !webContainerStatus.isBooted
    });
  }
}, [activeView]); 



const [description , setDescription] = useState<Descriptions[]>([]); 
const handleDescriptions = (nDescriptions : Descriptions[]) => {
  try {

    setDescription(prevDesc => {
      const newDesc : Descriptions[]   = nDescriptions.filter(desc => !prevDesc.some(prevdesc => prevdesc.text === desc.text));
      
      if (newDesc.length == 0) {
        return [...prevDesc]
      } 
      return [...prevDesc , ...newDesc]
    })
  
  } catch(error) {
    throw error 
  }
}


  console.log(updatePhase)

  const StatusIcon = ({ status } :  { status: "loading" | "waiting" | "completed" }) => {
    if (status === 'loading') {
      return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />;
    }
    if (status === 'completed') {
      return <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
        <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
      </div>;
    }
    return <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700" />;
  };





  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);


  const handleSendMessage = () => {
    try {
      if(inputMessage.trim())  {
        setIsTyping(true);
        // Simulate AI thinking
        setTimeout(() => {
          setChats(prevChats => [
            ...prevChats,
            { id: prevChats.length + 1, chat: inputMessage }
          ]);
          setInputMessage('');
          setIsTyping(false);
        }, 500);
      }
    }  catch (error) {
      console.error("error : ", error) 
      throw error  
    }
  }


  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }; 



  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [Chats]);





  return (



// Update the wrapper div and panels with these styles:
<div className="h-screen w-full bg-white dark:bg-[#0a0f1d]">
  <div className="absolute top-6 right-6 z-50">
    <button
      onClick={() => setIsDark(!isDark)}
      className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100 transition-colors duration-200"
      aria-label="Toggle dark mode"
    >
      {isDark ? (
        <Sun className="w-6 h-6" />
      ) : (
        <Moon className="w-6 h-6" />
      )}
    </button>
  </div>
  <PanelGroup direction="horizontal" className="h-full">
  <Panel defaultSize={25} minSize={20}>
      <div className="h-full bg-gradient-to-b from-gray-50/90 to-white/90 dark:from-gray-800/90 dark:to-gray-900/90 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-700/30 flex flex-col transition-all duration-300">
        {/* Enhanced Header */}
        <div className="px-6 py-4 border-b border-gray-200/50 dark:border-gray-700/30 bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg">
  <div className="flex items-center justify-between">
    <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center space-x-3">
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-500/10 dark:bg-purple-500/20">
        <Code className="w-5 h-5 text-purple-500" />
      </div>
      <span>AI Code Generation</span>
    </h2>
    {isTyping && (
      <div className="flex items-center space-x-2">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
        </div>
        <span className="text-sm text-purple-500">Processing...</span>
      </div>
    )}
  </div>
  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium line-clamp-2 flex items-center space-x-2">
    <Sparkles className="w-4 h-4 text-amber-500" />
    <span>Prompt: {initialPrompt}</span>
  </p>
</div>
        {/* Main Scrollable Container */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
          <div className="flex flex-col min-h-full">
            {/* Progress Steps with Enhanced Design */}
            <div className="pt-2 px-4">
              <div className="rounded-lg bg-white/70 dark:bg-gray-800/70 shadow-lg ring-1 ring-gray-900/5 dark:ring-white/10 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                <div className="p-3 space-y-3">
                  {/* First Description with Glow Effect */}
                  {description.length > 0 && (
                    <div className="flex items-start space-x-4 mb-3 group">
                      <div className="mt-1.5 flex-shrink-0">
                        <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 shadow-lg shadow-purple-500/30 group-hover:shadow-purple-500/50 transition-all duration-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 leading-relaxed tracking-wide">
                          {description[0].text}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Enhanced Steps Container */}
                  <div className="grid grid-cols-3 gap-3">
                    {steps.map((message, index) => (
                      <div
                        key={message.id}
                        className="flex items-start space-x-2 group hover:bg-gray-50/50 dark:hover:bg-gray-700/50 rounded-lg p-2 transition-all duration-200"
                      >
                        <div className="mt-1 flex-shrink-0">
                          <StatusIcon status={message.status} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-200">
                            {message.title}
                          </p>
                          {message.description && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-200">
                              {message.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Chat Messages */}
            <div className="flex-1 p-4 space-y-4">
              {Chats.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-white/80 dark:bg-gray-700/50 p-3 rounded-lg shadow-sm hover:shadow-md hover:bg-white/90 dark:hover:bg-gray-700/60 transition-all duration-200 group"
                >
                  <p className="text-gray-900 dark:text-white text-sm group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors duration-200">
                    {item.chat}
                  </p>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>

        {/* Enhanced Input Section */}
        {/* <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/30 bg-gradient-to-b from-white/50 to-gray-50/50 dark:from-gray-800/50 dark:to-gray-900/50 backdrop-blur-lg"> */}
        <div className="flex items-center space-x-1 -mt-2 relative z-6 py-5 transform ">
  <div className="relative flex-1">
    {/* Glow effect container */}
    <div className="absolute inset-0 rounded-full bg-purple-500/20 blur-md -z-10 animate-pulse" />
    <input
      type="text"
      value={inputMessage}
      onChange={(e) => setInputMessage(e.target.value)}
      onKeyPress={(e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSendMessage();
        }
      }}
      placeholder="Type your message..."
      className="w-full px-4 py-4 bg-white/90 dark:bg-gray-900/90 border-2 border-purple-500/30 dark:border-purple-400/30 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-200 pr-12 backdrop-blur-sm"
    />
    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
      Press ⏎ to send
    </div>
  </div>
  <button
    onClick={handleSendMessage}
    className="p-2.5 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500/50 shadow-lg hover:shadow-xl transition-all duration-200 group relative"
  >
    {/* Button glow effect */}
    <div className="absolute inset-0 rounded-full bg-purple-500/50 blur-md -z-10 group-hover:bg-purple-600/50" />
    <Send className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
  </button>
</div>
        {/* </div> */}
      </div>
    </Panel>
      <PanelResizeHandle className="w-1.5 bg-gray-200 dark:bg-gray-700/30 hover:bg-blue-500 transition-colors" />

    {/* File Explorer Panel */}
    <Panel defaultSize={20} minSize={15}>
          <div className="h-full bg-gray-50 dark:bg-gray-800/60 border-r border-gray-200 dark:border-gray-700/30">
            <FileExplorer fileSystem={fileSystem} onFileSelect={handleFileSelect}/>
          </div>
        </Panel>
        
        <PanelResizeHandle className="w-1.5 bg-gray-200 dark:bg-gray-700/30 hover:bg-blue-500 transition-colors" />
        
        {/* Editor/Preview Panel */}
        <Panel defaultSize={55}>
          <div className="h-full flex flex-col bg-white dark:bg-gray-800">
            {/* View Toggle */}
            <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-700">
      <div className="relative rounded-full w-48 h-10 bg-gray-200 dark:bg-gray-700 p-1">
        {/* Sliding background */}
        <div
          className={`absolute top-1 h-8 w-24 rounded-full bg-blue-900 transition-all duration-300 ease-in-out ${
            activeView === 'preview' ? 'left-24' : 'left-1'
          }`}
        />
        
        {/* Buttons container */}
        <div className="relative flex h-full">
          <button
            onClick={() => setActiveView('code')}
            className={`flex-1 rounded-full text-sm font-medium transition-colors duration-300 z-10 ${
              activeView === 'code'
                ? 'text-white'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Code
          </button>
          <button
            onClick={() => setActiveView('preview')}
            className={`flex-1 rounded-full text-sm font-medium transition-colors duration-300 z-10 ${
              activeView === 'preview'
                ? 'text-white'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Preview
          </button>
        </div>
      </div>
    </div>

            {/* Tab Bar */}
            <TabBar
              tabs={openTabs}
              activeTab={activeTabId || ''}
              onTabClick={setActiveTabId}
              onTabClose={handleTabClose}
            />

            {/* Editor/Preview Content */}
<div className="flex-1 overflow-hidden">
  {activeView === 'code' ? (
    activeTabId ? (
      <Editor
        height="70%"
        theme={'vs-dark'}
        language={openTabs.find(tab => tab.id === activeTabId)?.file.language}
        value={openTabs.find(tab => tab.id === activeTabId)?.file.content}
        onChange={(value) => handleEditorChange(value, activeTabId)}
        options={{
          minimap: { enabled: true },
          fontSize: 20,
          lineNumbers: 'on',
          roundedSelection: true,
          scrollBeyondLastLine: false,
          readOnly: false, 
          automaticLayout: true,
          fontFamily: 'Consolas, "Courier New", monospace'
        }}
      />
    ) : ( //// empty screen code screen 
      <div className="h-full w-full flex items-center justify-center text-gray-500 dark:text-gray-400">
        Select a file to start editing
      </div>
    )
  ): /////preview//////component 
   (
    <div className="h-full w-full bg-white dark:bg-gray-900">

    <div className="text-gray-600 dark:text-gray-300">Loading preview...</div>
    {/* <iframe
        ref={iframeRef}
        title="preview"
        className="w-full h-full border-none"
        src="about:blank"
      /> */}

<div className="h-full flex items-center justify-center text-gray-400">
      {!url && <div className="text-center">
        <p className="mb-2">Loading...</p>
      </div>}
      {url && <iframe width={"100%"} height={"100%"} src={url} />}
    </div>
    </div>
    
  )}
</div>

          </div>
    
        </Panel>
  </PanelGroup>
</div>
  );

}
