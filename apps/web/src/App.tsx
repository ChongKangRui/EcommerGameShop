//import "./App.css";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/shop/Home";
import Layout from "./components/ShopLayout";
import About from "./pages/shop/About";

import Login from "./pages/user/Login";
import Register from "./pages/user/Register";
import Shop from "./pages/shop/Shop";
import Cart from "./pages/user/Cart";
import Product from "./pages/shop/Product";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthProvider";
import { PublicOnlyRoute } from "./route/PublicOnlyRoute";
import Profile from "./pages/user/Profile";
import { PrivateOnlyRoute } from "./route/PrivateOnlyRoute";
import { AdminOnlyRoute } from "./route/AdminOnlyRoute";
import { lazy, Suspense } from "react";
import AdminLayout from "./components/admin/AdminLayout";
import Checkout from "./pages/user/Checkout";
import OrderConfirmation from "./pages/user/OrderConfirmation";
import OrderHistory from "./pages/user/OrderHistory";
import Order from "./pages/user/Order";
import NotFound from "./pages/NotFound";
import Loading from "./components/Loading";

// Admin-only pages — lazy-loaded since a regular shopper never needs this code
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AddProduct = lazy(() => import("./pages/admin/AddProduct"));
const AdminProductList = lazy(() => import("./pages/admin/AdminProductList"));
const UpdateProduct = lazy(() => import("./pages/admin/UpdateProduct"));
const AdminOrderList = lazy(() => import("./pages/admin/AdminOrderList"));
const AdminOrder = lazy(() => import("./pages/admin/AdminOrder"));
const AdminRefundList = lazy(() => import("./pages/admin/AdminRefundList"));
const AdminRefund = lazy(() => import("./pages/admin/AdminRefund"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes before data is stale
      retry: 1, // retry once on failure
    },
  },
});

// small helper so every lazy admin route gets the same fallback consistently
const withSuspense = (children: React.ReactNode) => (
  <Suspense fallback={<Loading />}>{children}</Suspense>
);

function App() {
  return (
    <div>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Routes>
            {/* Putting layout for every page */}
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/collections" element={<Shop />} />
              <Route path="/collections/:id" element={<Product />} />
              <Route path="/carts" element={<Cart />} />
              <Route
                path="/orders"
                element={
                  <PrivateOnlyRoute>
                    <OrderHistory />
                  </PrivateOnlyRoute>
                }
              />
              <Route
                path="/order/:orderId"
                element={
                  <PrivateOnlyRoute>
                    <Order />
                  </PrivateOnlyRoute>
                }
              />
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

            <Route
              path="/checkout"
              element={
                <PrivateOnlyRoute>
                  <Checkout />
                </PrivateOnlyRoute>
              }
            ></Route>
            <Route
              path="/order-confirmation/:orderId"
              element={
                <PrivateOnlyRoute>
                  <OrderConfirmation />
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

            {/* Admin Only*/}
            <Route
              path="/admin"
              element={
                <AdminOnlyRoute>
                  <AdminLayout />
                </AdminOnlyRoute>
              }
            >
              <Route index element={withSuspense(<AdminDashboard />)} />
              <Route path="/admin/addproduct" element={withSuspense(<AddProduct />)} />
              <Route path="/admin/products" element={withSuspense(<AdminProductList />)} />
              <Route path="/admin/refunds" element={withSuspense(<AdminRefundList />)} />
              <Route path="/admin/refund/:orderId" element={withSuspense(<AdminRefund />)} />
              <Route path="/admin/products/:id" element={withSuspense(<UpdateProduct />)} />
              <Route path="/admin/orders" element={withSuspense(<AdminOrderList />)} />
              <Route path="/admin/orders/:orderId" element={withSuspense(<AdminOrder />)} />
              {/* index = default child */}
              {/* future routes */}
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </QueryClientProvider>
    </div>
  );
}

export default App;