const express = require("express");
const router = express.Router();
const {
  addInteraction,
  getCustomerInteractions,
} = require("../controllers/interactionController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.post("/", addInteraction);
router.get("/:customerId", getCustomerInteractions);

module.exports = router;
