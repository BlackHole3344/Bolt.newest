

export enum StepType {
    CreateFile, 
    CreateFolder,
    EditFile , 
    DeleteFile , 
    RunScript
}

export type FileType = StepType.CreateFile | StepType.CreateFolder;

export interface Step{
    id : number
    title : string , 
    status : "loading" | "waiting" | "completed" , 
    type : StepType  ,
    code? : string 
    description? : "null"
} 

export interface Project{
    prompt? : string , 
    steps : Step[],
    error? : string 
}

