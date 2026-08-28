import { API_BASE_URL } from "./base";

export type QuestionCategory = { id:number; name:string; group_id:number; group_name:string };
export type Answer = { id:number; question_id:number; user_id:number; user_name:string; content:string; created_at:string };
export type Question = { id:number; user_id:number; user_name:string; category_id:number; category_name:string; department_name:string; title:string; content:string; visibility:"public"|"private"; status:"open"|"answered"|"resolved"; created_at:string; updated_at:string; answers?:Answer[] };
type ErrorBody={error?:{message?:string}};
const read=async<T>(request:Promise<Response>):Promise<T>=>{const response=await request;const body=await response.json().catch(()=>null) as T|ErrorBody|null;if(!response.ok){throw new Error(body&&typeof body==="object"&&"error" in body?body.error?.message??"処理に失敗しました":"処理に失敗しました")}return body as T};
const options=(method="GET",body?:unknown):RequestInit=>({method,credentials:"include",headers:body?{"Content-Type":"application/json"}:undefined,body:body?JSON.stringify(body):undefined});
export const getQuestionCategories=()=>read<QuestionCategory[]>(fetch(`${API_BASE_URL}/api/question-categories`,options()));
export const createQuestionCategory=(name:string,groupId:number)=>read<QuestionCategory>(fetch(`${API_BASE_URL}/api/question-categories`,options("POST",{name,group_id:groupId})));
export const getQuestions=(status="")=>read<Question[]>(fetch(`${API_BASE_URL}/api/questions?status=${encodeURIComponent(status)}`,options()));
export const getQuestion=(id:number)=>read<Question>(fetch(`${API_BASE_URL}/api/questions/${id}`,options()));
export const createQuestion=(input:{category_id:number;title:string;content:string;visibility:"public"|"private"})=>read<Question>(fetch(`${API_BASE_URL}/api/questions`,options("POST",input)));
export const answerQuestion=(id:number,content:string)=>read<Answer>(fetch(`${API_BASE_URL}/api/questions/${id}/answers`,options("POST",{content})));
export const resolveQuestion=async(id:number)=>{const response=await fetch(`${API_BASE_URL}/api/questions/${id}/resolve`,options("PATCH"));if(!response.ok)throw new Error("解決済みにできませんでした")};
