import { useMutation } from "@tanstack/react-query";
import { type FieldValues } from "react-hook-form";
import api from "@/lib/api";
import axios from "axios";

export function useRegister() {
  return useMutation({
    mutationFn: async (data: FieldValues) => {
      try {
        const res = await api.post("/register", data);
        return res.data;
      } catch (err: any) {
       

        const message =
          axios.isAxiosError(err) && err.response?.data?.error
            ? err.response?.data?.error
            : "Register Failed";
        throw new Error(message);
      }
    },
  });
}

export function useLogin() {
  return useMutation({
    mutationFn: async (data: FieldValues) => {
      try {
        const res = await api.post("/login", data);
        return res.data;
      } catch (err: any) {
       
        const message =
          axios.isAxiosError(err) && err.response?.data?.error
            ? err.response?.data?.error
            : "Login Failed";
        throw new Error(message);
      }
    },
  });
}

export function useProfileUpdate(){
  return useMutation({
    mutationFn: async (data: FieldValues) => {
      try {
        const res = await api.put("/me", data);
        return res.data;
      } catch (err: any) {
       
        const message =
          axios.isAxiosError(err) && err.response?.data?.error
            ? err.response?.data?.error
            : "Login Failed";
        throw new Error(message);
      }
    },
  });
}

export function usePasswordUpdate(){
  return useMutation({
    mutationFn: async (data: FieldValues) => {
      try {
        const res = await api.put("/me/password", data);
        return res.data;
      } catch (err: any) {
        
        const message =
          axios.isAxiosError(err) && err.response?.data?.error
            ? err.response?.data?.error
            : "Login Failed";
        throw new Error(message);
      }
    },
  });
}