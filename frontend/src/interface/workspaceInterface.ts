export interface FileContent {
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
  
export interface Payload {
    id: number;
    prompt?: string;
    artifact?: string;
    FileSys?: FileSystemItem;
}
  
  export interface TabItem {
    file: FileContent;
    id: string;
  }
  
  export interface ParsedContent {
    START_DESCRIPTION: string;
    artifact: string;
    END_DESCRIPTION: string;
  }
  
  export interface Descriptions {
    id: number;
    text: string;
  }
  
  export interface ChatItem {
    id: number;
    chat: string;
  }
  
  export interface FileExplorerProps {
    fileSystem: FileSystemItem[];
    onFileSelect: (file: FileContent) => void;
  }