



import React, { useState, useEffect , useRef} from 'react';
import { useLocation } from 'react-router-dom';
import { MessageSquare,  X, Moon, Sun, ChevronRight, Signal } from 'lucide-react';
import { Loader2, Send } from 'lucide-react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import {  parseTemplateToProject } from '../xmlparser';
import { Step, StepType } from '../types/artifact';
import { Folder, FileCode2, FileType, FileText } from 'lucide-react';

  

interface FileContent {
  name: string;
  content: string;
  language: string;
  path: string;
}

interface FileSystemItem {
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
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' ||
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  const [payloaditems , setPayload ] = useState<Payload[]>([]) ; 
  const initialized = useRef(false);

  const initialPrompt = location.state?.prompt || 'No prompt provided';


 ///// Progress panel thing 
  const [steps , setSteps] = useState<Step[]>([]);
  ////File explorar panel thing 
  const [fileSystem, setFileSystem] = useState<FileSystemItem[]>([
  ]);




  const updateStepStatus = (filePath: string) => {
    setSteps(prevSteps => 
      prevSteps.map(step => {
        // Only update status for file-related operations
        if (
          `/${step.title}` === filePath && 
          step.status !== "completed" &&
          (step.type === StepType.CreateFile || step.type === StepType.EditFile)
        ) {
          return { ...step, status: "completed" };
        }
        return step;
      })
    );
  };

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

  // const findFileInSystem  = (filesytem : FileSystemItem[] , path : string ) : FileSystemItem | undefined => {
  //   for (const item of fileSystem) {
  //     if (item.path == path) {
  //       return item ; 
  //     }
  //     if(item.children) {
  //       const exist = findFileInSystem(item.children , path) 
  //       if (exist){
  //         return exist 
  //       }
  //     }

  //   }
  //   return undefined
  // }
  
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

  // const updateFilesystem = (path : string , newContent : string  ) => {
  //   setFileSystem(prev => {
  //     const updateFileTree = (items : FileSystemItem[]) : FileSystemItem[] => {
  //       return items.map( item => {
  //         if(item.path == path && item.type == "file") {
  //           return {...item , content : newContent }
  //         } if (item.type == "directory" && item.children) {
  //           return  {
  //             ...item , 
  //             children : updateFileTree(item.children)
  //           }
  //         }
  //         return item ; 
  //       })
  //     }
  //   return updateFileTree(prev) ;
  // } 
  //   )
  // }
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
    const STARTtdesMatch = input.match(/^([\s\S]*?)(?=<boltArtifact|$)/);
    result.START_DESCRIPTION = STARTtdesMatch ? STARTtdesMatch[1].trim() : '';
  
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
  const [status, setStatus] = useState<'idle' | 'mounting' | 'updating'| 'updated'>('idle');



 
  const controllerRef = useRef<AbortController | null>(null);
   ////// triggered whenever page is loaded (1st event)
  useEffect(() => {
    // if (!initialized.current) {
    //   initialized.current = true;
    //   init();
    // }
    controllerRef.current = new AbortController();
    init(controllerRef.current.signal);

  return () => {
    controllerRef.current?.abort();
  };
  }, []);
  


////////issue./////"prevent init running everytime on reload/////////////

  const init = async (signal: AbortSignal)  => {
    
    try {
    const response = await axios.post(`http://localhost:3000/test`, { messages: payloaditems
    } ,  { signal } )
    console.log("request")
    if(!response) {
      console.log("no response")
    } 

    const {message} = response.data; 
    // console.log(parseTemplateToProject(message))
    
  ////////parseTemplateToProject(xmlparser) return Step[]  
   setSteps(parseTemplateToProject(message).steps.map((x : Step) => ({
      ...x , 
      status : "loading" //// default sets it to loading 
    }) ))

    setStatus('mounting');
  } catch (error) {
    console.error("Init error:", error);
    setStatus('idle');
  }

  }
  ///// Doubtful about is it working fine or not 
  useEffect(() => {
    // Only process if we have steps
    if (!steps.length) return;
    console.log(steps.length) 
    const updateFileSystem = async () => {
      // const updatedSteps = new Set();
      setFileSystem(prevFileSystem => {
        const newFileSystem = [...prevFileSystem];
        const processedSteps = new Set();
         const pendingSteps = steps.filter(
          step => step.status === "waiting" || step.status === "loading" 
         )
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
               newItem = {
                name: step.title,
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
                newItem = {
                  name: step.title,
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
            setStatus('updating');
          });
        }
  
        return newFileSystem;
      });
      // setIsMounting(false);
    };

    // setSteps(prevSteps => 
    //   prevSteps.map(step => ({
    //     ...step,
    //     status: step.status === "loading" ? "completed" : step.status
    //   }))
    // );
    
    
    // console.log(FileSystem) 
    setTimeout(() => {
    updateFileSystem(); 
  } , 3000)  

    // console.log(fileSystem)
  }, [status]);



  const [description , setDescription] = useState<string>('') ; 

  useEffect(() => {
    if(status === 'updated') return ; 
    if(status !== 'updating') return ; 
    let mounted = true;
    
    const getUpdates = async (signal : AbortSignal) => {
      try {
        const { data } = await axios.post(`http://localhost:3000/test2` , {
      payload : payloaditems  
        } , { signal});
        // if (!mounted) return;  

        console.log(data) 
        
        const parsed = parseContent(data.data);
        setDescription(parsed.START_DESCRIPTION);
        console.log(parsed.START_DESCRIPTION)
        console.log(parsed.END_DESCRIPTION)

        console.log("parsed : " , parsed);
  
        const newSteps = parseTemplateToProject(parsed.artifact).steps;
        console.log(newSteps) 
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
          setStatus(hasChanges ? 'updating' : 'idle');
        return hasChanges ? Array.from(stepMap.values()) : prevSteps;
        });
      } catch (error) {
        console.error("Update error:", error);
      }
    };
    setTimeout( () => {
      controllerRef.current = new AbortController();
      getUpdates(controllerRef.current.signal)
      setStatus("updated")

    } , 3000)
      

  
    return () => {
      mounted = false;
    };
  }, [status]);



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
        <div className="h-full bg-gray-50/80 dark:bg-gray-800/60 backdrop-blur-xl border-r border-gray-200 dark:border-gray-700/30 flex flex-col transition-colors duration-200">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700/30 bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-blue-500" />
              <span>Generation Progress</span>
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1.5 font-medium line-clamp-2">
              Prompt: {initialPrompt}
            </p>
          </div>

          {/* Progress Steps */}
          <div className="p-4 flex-1 overflow-auto">
            <div className="rounded-lg bg-white/70 dark:bg-gray-800/70 shadow-lg ring-1 ring-gray-900/5 dark:ring-white/10 backdrop-blur-sm">
              <div className="p-2 space-y-1">
                {steps.map((message) => (
                  <div
                    key={message.id}
                    className="flex items-start space-x-3 p-2 rounded-md hover:bg-gray-50/80 dark:hover:bg-gray-700/40 transition-all duration-200"
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      <StatusIcon status={message.status} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {message.title}
                      </p>
                      {message.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                          {message.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Input Box */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700/30 bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 bg-white/80 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600/50 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm font-medium shadow-sm transition-all duration-200"
              />
              <button className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-sm hover:shadow transition-all duration-200">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
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
  ) : /////preview//////component 
   (
    <div className="h-full w-full bg-white dark:bg-gray-900">
      <iframe
        title="preview"
        className="w-full h-full border-none"
        srcDoc={getHTMLContent()}
      />
    </div>
  )}
</div>
  
          </div>
    
        </Panel>
  </PanelGroup>
</div>
  );
}
