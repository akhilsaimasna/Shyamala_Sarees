export const MAX_CHAT_BYTES=16*1024;
export class ChatInputError extends Error{readonly status:number;constructor(status:number,message:string){super(message);this.status=status;}}
export async function readChatMessages(request:Request):Promise<{role:"user"|"assistant";content:string}[]>{
 if(!request.headers.get("content-type")?.toLowerCase().startsWith("application/json"))throw new ChatInputError(415,"JSON is required.");
 const reader=request.body?.getReader();if(!reader)throw new ChatInputError(400,"A message is required.");
 let length=0;const chunks:Uint8Array[]=[];
 try{while(true){const {value,done}=await reader.read();if(done)break;length+=value.byteLength;if(length>MAX_CHAT_BYTES){await reader.cancel();throw new ChatInputError(413,"Request is too large.");}chunks.push(value);}}finally{reader.releaseLock();}
 const bytes=new Uint8Array(length);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}
 let payload:unknown;try{payload=JSON.parse(new TextDecoder().decode(bytes));}catch{throw new ChatInputError(400,"Invalid JSON.");}
 const messages=payload && typeof payload==="object" && "messages" in payload?payload.messages:null;
 if(!Array.isArray(messages)||messages.length===0||messages.length>12)throw new ChatInputError(400,"Send between 1 and 12 messages.");
 for(const message of messages){if(!message||typeof message!=="object"||!["user","assistant"].includes(message.role)||typeof message.content!=="string"||!message.content.trim()||message.content.length>2000)throw new ChatInputError(400,"Invalid message.");}
 if(messages.at(-1).role!=="user")throw new ChatInputError(400,"The last message must be from a user.");
 return messages;
}
