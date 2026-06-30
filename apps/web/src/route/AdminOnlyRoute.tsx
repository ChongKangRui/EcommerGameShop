import { useAuth } from "@/context/AuthProvider"
import { Navigate } from "react-router";
import {type  ChildrenOnlyProps } from "@/components/CommonType";

export function AdminOnlyRoute({children}: ChildrenOnlyProps){
    const {isLoading, isAuthenticated,user} = useAuth();
  
  //console.log("AdminOnlyRoute:", { isLoading, user }); 
 // console.log("ADmin only route trigger");
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