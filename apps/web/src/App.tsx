import { useState } from "react";
//import "./App.css";
import { Route, Routes } from "react-router";
import Home from "./pages/shop/Home";
import Layout from "./components/ShopLayout";
import About from "./pages/shop/About";

import Login from "./pages/user/Login";
import Register from "./pages/user/Register";
import Shop from "./pages/shop/Shop";
import Cart from "./pages/user/Checkout";
import Product from "./pages/shop/Product";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthProvider";
import { PublicOnlyRoute } from "./route/PublicOnlyRoute";
import Profile from "./pages/user/Profile";
import { PrivateOnlyRoute } from "./route/PrivateOnlyRoute";
import { AdminOnlyRoute } from "./route/AdminOnlyRoute";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLayout from "./components/admin/AdminLayout";
import AddProductForm from "./components/admin/product/add/AddProductForm";
import AddProduct from "./pages/admin/AddProduct";
import AdminProductList from "./pages/admin/AdminProductList";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes before data is stale
      retry: 1, // retry once on failure
    },
  },
});

function App() {
  return (
    <div>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Routes>
            {/* Putting layout for every page */}
            <Route element={<Layout />}>
              <Route path="/" element={<Home />}></Route>
              <Route path="/about" element={<About />}></Route>
              <Route path="/collections" element={<Shop />}></Route>
              <Route
                path="/collections/:category/:id"
                element={<Product />}
              ></Route>
              <Route path="/carts" element={<Cart />}></Route>
            </Route>

            {/* Profile */}
            <Route
              path="/profile"
              element={
                <PrivateOnlyRoute>
                  <Profile />
                </PrivateOnlyRoute>
              }
            ></Route>
            {/* Login */}
            <Route
              path="/login"
              element={
                <PublicOnlyRoute>
                  <Login />
                </PublicOnlyRoute>
              }
            ></Route>
            {/* Register */}
            <Route
              path="/register"
              element={
                <PublicOnlyRoute>
                  <Register />
                </PublicOnlyRoute>
              }
            ></Route>

            {/* Admin */}
            <Route
              path="/admin"
              element={
                <AdminOnlyRoute>
                  <AdminLayout />
                </AdminOnlyRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="/admin/addproduct" element={<AddProduct />} /> 
               <Route path="/admin/products" element={<AdminProductList />} /> 
              {/* index = default child */}
              {/* future routes */}
              {/* <Route path="products" element={<AdminProductsPage />} /> */}
              {/* <Route path="orders" element={<AdminOrdersPage />} /> */}
            </Route>
            
          </Routes>
        </AuthProvider>
      </QueryClientProvider>
    </div>
  );
}

export default App;
