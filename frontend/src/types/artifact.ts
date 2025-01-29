

export enum StepType {
    CreateFile , 
    CreateFolder ,
    EditFile , 
    DeleteFile , 
    RunScript
}

export interface Step{
    id : number
    title : string , 
    status : "loading" | "waiting" | "completed" , 
    type : StepType  ,
    code? : string 
} 

export interface Project{
    prompt : string , 
    steps : Step[] ,
    error? : string 
}