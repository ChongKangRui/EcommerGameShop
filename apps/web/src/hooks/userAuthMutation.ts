import { useMutation } from "@tanstack/react-query";
import { type FieldValues } from "react-hook-form";
import api from "@/lib/api";
import axios from "axios";

export function useRegister() {
  return useMutation({
    mutationFn: async (data: FieldValues) => {
     
        const res = await api.post("/register", data);
        return res.data;
    },
  });
}

export function useLogin() {
  return useMutation({
    mutationFn: async (data: FieldValues) => {
      
        const res = await api.post("/login", data);
        return res.data;
      
    },
  });
}

export function useProfileUpdate(){
  return useMutation({
    mutationFn: async (data: FieldValues) => {
    
        const res = await api.put("/me", data);
        return res.data;
      
    },
  });
}

export function usePasswordUpdate(){
  return useMutation({
    mutationFn: async (data: FieldValues) => {
     
        const res = await api.put("/me/password", data);
        return res.data;
      
    },
  });
}