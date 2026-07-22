const express = require("express");
const router = express.Router();
const {
  getCustomers,
  addCustomer,
  updateCustomer,
  assignCustomer,
  deleteCustomer,
} = require("../controllers/customerController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect);

router.route("/").get(getCustomers).post(addCustomer);

router
  .route("/:id")
  .put(updateCustomer)
  .delete(authorize("superadmin", "manager"), deleteCustomer);

router.put("/:id/assign", authorize("superadmin", "manager"), assignCustomer);

module.exports = router;
