import { Router } from "express";
import { getShops , getShopById} from "../../controllers/userControllers/shopController.js";

import { isAuthenticated, authorize } from "../../middlewares/auth.js";

const router = Router();

router.post("/all-shops",getShops)
router.get("/:id",getShopById)


export default router;