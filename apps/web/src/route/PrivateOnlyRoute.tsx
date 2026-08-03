import { useAuth } from "@/context/AuthProvider"
import { Navigate } from "react-router-dom";
import {type  ChildrenOnlyProps } from "@/components/CommonType";
import Loading from "@/components/Loading";

// protect private(require login) only route
export function PrivateOnlyRoute({children}: ChildrenOnlyProps){
    const {isLoading, isAuthenticated} = useAuth();

    console.log("Private route trigger");

    if(isLoading){
        console.log("Still loading");
        return (
            <Loading/>
        )
    }

    return (
        isAuthenticated ? 
            <>{children}</> : <Navigate to="/login" replace /> 
    )
}