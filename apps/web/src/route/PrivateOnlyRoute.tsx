import { useAuth } from "@/context/AuthProvider"
import { Navigate } from "react-router";
import {type  ChildrenOnlyProps } from "@/components/CommonType";

export function PrivateOnlyRoute({children}: ChildrenOnlyProps){
    const {isLoading, isAuthenticated} = useAuth();

    console.log("Private route trigger");
    if(isLoading){
        return (
            <div>
            </div>
        )
    }

    return (
        isAuthenticated ? 
            <>{children}</> : <Navigate to="/login" replace /> 
    )
}