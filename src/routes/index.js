//Exports all the routes
import { Router } from "express";
import authRoutes from "./authRoutes.js"; //for authorisation
import googleApiRoutes from './googleMapsRoutes.js'

//user specific routes
import shopRoutes from "./user/shopRoutes.js";
import bookigRoutes from './user/bookingRoutes.js'

// import productAdminRoutes from "./productAdmin.js";
// import productUserRoutes from "./productUser.js";
// import paymentRoutes from "./paymentRoutes.js";
// import orderRoutes from "./order.js";
// import commitmentRoutes from "./commitmentRoutes.js";
// import orderAdminRoutes from "./orderAdmin.js";
// import userAdminRoutes from "./userAdminRoutes.js";
// import testRoutes from "./test.js";
// import commitmentAdminRoutes from "./commitmentRoutesAdmin.js";
// import adminAddressRoutes from "./adminAddressRoutes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/shops", shopRoutes);
router.use("/google-apis", googleApiRoutes)
router.use("/bookings", bookigRoutes)

// router.use("/productUser", productUserRoutes);
// router.use("/payments", paymentRoutes);
// router.use("/order", orderRoutes);
// router.use("/commitment", commitmentRoutes);

// //admin routes
// router.use("/product-admin", productAdminRoutes);
// router.use("/admin/order", orderAdminRoutes);
// router.use("/admin/user-admin", userAdminRoutes);
// router.use("/admin/commitment-admin", commitmentAdminRoutes);
// router.use("/admin/address-admin", adminAddressRoutes);

// router.use("/test", testRoutes);

export default router;
