import { Router } from "express";
import {
  getRoleRequests,
  sendRoleRequest,
  approveRoleRequest,
  declineRoleRequest,
} from "../controllers/roleRequestController";

const router = Router();

router.get("/", getRoleRequests);
router.post("/", sendRoleRequest);
router.post("/approve/:id", approveRoleRequest);
router.post("/decline/:id", declineRoleRequest);

export default router;
