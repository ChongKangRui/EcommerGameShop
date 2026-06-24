import { createContext, useContext, useState, useEffect } from "react";
import api from "../lib/api";
import type { AxiosError } from "axios";
import { type ChildrenOnlyProps } from "@/components/CommonType";
import { useNavigate } from "react-router";

type UserType = {
  first_name: string;
  last_name: string;
  email: string;
  address: string;
  role: string;

};

type AuthContextType = {
  user: UserType | null;

  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string, user: UserType) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: ChildrenOnlyProps) {
  const [user, setUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  //const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("Authenticatiing");
    if (!token) {
      setIsLoading(false);
      return;
    }

    // get the user data and store in the global context
    api
      .get("/auth/verify")
      .then((res) => {
        setUser(res.data.user);
        console.log(res.data.user);
      })
      .catch((err: AxiosError) => {
        localStorage.removeItem("token");
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = (token: string, userData: UserType) => {
    localStorage.setItem("token", token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    //window.location.href = "/";
    // navigate("/", {replace: true});
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated: user !== null, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
