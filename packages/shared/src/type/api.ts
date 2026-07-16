import { extend } from "zod/mini";

export interface ApiError{
  error: string;
  status: number;
}

// standard success response
export interface ApiSuccess {
  message: string;
}

// generic paginated response
export interface PaginatedResponse<T> extends ApiSuccess {
  products: T[];
  total: number;
 
}