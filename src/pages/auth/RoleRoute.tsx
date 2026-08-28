import { Navigate,Outlet } from "react-router-dom";import { useAuth } from "../../contexts/auth";
export const RoleRoute=({roles}:{roles:Array<"student"|"teacher"|"admin">})=>{const{user,loading}=useAuth();if(loading)return <p>読み込み中...</p>;if(!user)return <Navigate to="/login" replace/>;return roles.includes(user.role)?<Outlet/>:<Navigate to="/home" replace/>};
