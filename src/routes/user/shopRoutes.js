import { Router } from "express";
import { getShops } from "../../controllers/userControllers/shopController.js";

import { isAuthenticated, authorize } from "../../middlewares/auth.js";

const router = Router();

router.get("/all-shops",getShops)


export default router;