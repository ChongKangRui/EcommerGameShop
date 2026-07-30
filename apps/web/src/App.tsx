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
const AdminProductList = lazy(() => import("@/pages/admin/AdminProductList"));
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
import AdminLayout from "./components/admin/AdminLayout";
import AddProduct from "./pages/admin/AddProduct";
//import AdminProductList from "./pages/admin/AdminProductList";
import UpdateProduct from "./pages/admin/UpdateProduct";
import Checkout from "./pages/user/Checkout";
import OrderConfirmation from "./pages/user/OrderConfirmation";
import AdminOrderList from "./pages/admin/AdminOrderList";
import AdminOrder from "./pages/admin/AdminOrder";

import OrderHistory from "./pages/user/OrderHistory";
import Order from "./pages/user/Order";
import AdminRefundList from "./pages/admin/AdminRefundList";
import AdminRefund from "./pages/admin/AdminRefund";
import NotFound from "./pages/NotFound";
import Loading from "./components/Loading";

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
              <Route
                index
                element={
                  <Suspense fallback={<Loading />}>
                    <AdminDashboard />
                  </Suspense>
                }
              />
              <Route path="/admin/addproduct" element={<AddProduct />} />
              <Route
                path="/admin/products"
                element={
                  <Suspense fallback={<Loading />}>
                    <AdminProductList />
                  </Suspense>
                }
              />
              <Route path="/admin/refunds" element={<AdminRefundList />} />
              <Route path="/admin/refund/:orderId" element={<AdminRefund />} />
              <Route path="/admin/products/:id" element={<UpdateProduct />} />
              <Route path="/admin/orders" element={<AdminOrderList />} />
              <Route path="/admin/orders/:orderId" element={<AdminOrder />} />
              {/* index = default child */}
              {/* future routes */}
              {/* <Route path="products" element={<AdminProductsPage />} /> */}
              {/* <Route path="orders" element={<AdminOrdersPage />} /> */}
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </QueryClientProvider>
    </div>
  );
}

export default App;
