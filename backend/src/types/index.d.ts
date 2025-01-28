declare global {
    namespace express {
        interface Request {
            body : {
            prompt? : string 
        }} 
    }
}

export {} ; 