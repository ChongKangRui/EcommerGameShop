import { useState } from "react";
import "./App.css";
import { Route, Routes } from "react-router";
import Home from "./pages/Home";
import Layout from "./components/Layout";
import About from "./pages/About";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Shop from "./pages/Shop";
import Cart from "./pages/Checkout";
import Product from "./pages/Product";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthProvider";
import { PublicOnlyRoute } from "./route/PublicOnlyRoute";
import Profile from "./pages/Profile";
import { PrivateOnlyRoute } from "./route/PrivateOnlyRoute";

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

              <Route
              path="/profile"
              element={
                <PrivateOnlyRoute>
                  <Profile />
                </PrivateOnlyRoute>
              }
            ></Route>

            <Route
              path="/login"
              element={
                <PublicOnlyRoute>
                  <Login />
                </PublicOnlyRoute>
              }
            ></Route>

            <Route
              path="/register"
              element={
                <PublicOnlyRoute>
                  <Register />
                </PublicOnlyRoute>
              }
            ></Route>

          </Routes>
        </AuthProvider>
      </QueryClientProvider>
    </div>
  );
}

export default App;
