import { Router } from "express";
import {
  autocomplete,
  geocode
} from "../controllers/googleMapsController.js";
import { isAuthenticated, authorize } from "../middlewares/auth.js";

const router = Router();

router.get("/address-suggestions",autocomplete)
router.get("/place-details",geocode)



export default router;