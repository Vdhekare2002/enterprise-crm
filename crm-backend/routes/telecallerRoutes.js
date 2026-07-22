const express = require("express");
const router = express.Router();
const {
  getTelecallers,
  toggleTelecallerStatus,
} = require("../controllers/telecallerController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/", authorize("superadmin", "manager"), getTelecallers);
router.put(
  "/:id/toggle-status",
  authorize("superadmin", "manager"),
  toggleTelecallerStatus,
);

module.exports = router;
