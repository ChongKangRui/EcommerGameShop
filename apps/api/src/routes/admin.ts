import { Router } from "express";
import { getProduct, getProducts } from "src/controllers/productController";
import {
  activeProducts,
  addProduct,
  deleteProduct,
  deleteProducts,
  discountProducts,
  promoteProducts,
  updateProduct,
} from "src/controllers/admin/adminProductController";
import {
  getAllCustomerOrderTable,
  getDashboardData,
  getOrderAndCustomerInfo,
  updateOrdersStatus,
  updateOrderStatus,
} from "src/controllers/admin/adminOrderController";
import {
  getRefund,
  getRefundTable,
  massRejectRefundRequest,
  updateRefundStatus,
} from "src/controllers/admin/adminRefundController";
import { adminActionLimiter, adminBrowserLimiter } from "src/utils/rateLimitHelper";

const router = Router();

router.get("/orders", adminBrowserLimiter, getAllCustomerOrderTable);
router.get("/dashboard-report", adminBrowserLimiter, getDashboardData);
router.get("/orders/:orderId", adminBrowserLimiter, getOrderAndCustomerInfo);
router.patch("/order/:orderId/status", adminActionLimiter, updateOrderStatus);
router.patch("/orders/status", adminActionLimiter, updateOrdersStatus);

router.get("/refunds", adminBrowserLimiter, getRefundTable);
router.get("/refund/:orderId", adminBrowserLimiter, getRefund);
router.put("/refund/:refundId", adminActionLimiter, updateRefundStatus);
router.post("/refunds/reject", adminActionLimiter, massRejectRefundRequest);

router.post("/products", adminActionLimiter, addProduct);
router.get("/products", adminBrowserLimiter, getProducts);
router.get("/products/:id", adminBrowserLimiter, getProduct);
router.put("/products/:id", adminActionLimiter, updateProduct);
router.patch("/products/discount", adminActionLimiter, discountProducts);
router.patch("/products/promote", adminActionLimiter, promoteProducts);
router.patch("/products/active", adminActionLimiter, activeProducts);
router.delete("/product/:id", adminActionLimiter, deleteProduct);
router.delete("/products/", adminActionLimiter, deleteProducts);

export default router;
