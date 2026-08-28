import{Navigate}from"react-router-dom";import{useAuth}from"../../contexts/auth";
export const RoleHomePage=()=>{const{user,loading}=useAuth();if(loading)return <p className="min-h-dvh bg-slate-950 p-8 text-white">読み込み中...</p>;if(!user)return <Navigate to="/login" replace/>;return <Navigate to={user.role==="admin"?"/admin/users":"/timeline"} replace/>};
