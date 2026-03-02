import { Router } from "express";
import { createBooking} from "../../controllers/userControllers/bookingController.js";

import { isAuthenticated, authorize } from "../../middlewares/auth.js";

const router = Router();

router.post("/create-booking", isAuthenticated, authorize([100]), createBooking)



export default router;