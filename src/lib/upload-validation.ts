export const IMAGE_TYPES=["image/jpeg","image/png","image/webp","image/avif","image/gif"];
export const VIDEO_TYPES=["video/mp4","video/quicktime","video/webm"];
export function uploadProblem(file:{size:number;type:string},kind:"image"|"video"):string|null{
    const types=kind==="image"?IMAGE_TYPES:VIDEO_TYPES;
    const maximum=kind==="image"?10*1024*1024:50*1024*1024;
    if(!types.includes(file.type))return `Unsupported ${kind} format.`;
    if(file.size<=0 || file.size>maximum)return `${kind==="image"?"Images":"Videos"} must be between 1 byte and ${maximum/1024/1024} MB.`;
    return null;
}
