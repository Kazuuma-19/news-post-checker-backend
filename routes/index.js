const express = require("express");
const router = express.Router();
const studentController = require("../controller/studentController");

// students
router.get("/", studentController.index);

router.post("/", studentController.store);

router.put("/:id", studentController.update);

router.delete("/:id", studentController.destroy);
module.exports = router;
