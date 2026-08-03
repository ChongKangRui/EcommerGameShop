import { useAuth } from "@/context/AuthProvider"
import { Navigate } from "react-router-dom";
import {type  ChildrenOnlyProps } from "@/components/CommonType";


// protect admin only route
export function AdminOnlyRoute({children}: ChildrenOnlyProps){
    const {isLoading, isAuthenticated,user} = useAuth();
  
    if(isLoading){
        return (
            <div>
            </div>
        )
    }

    return (
        (isAuthenticated && user?.role === "admin") ? 
            <>{children}</> : <Navigate to="/" replace /> 
    )
}