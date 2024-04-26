import express from "express";
const router = express.Router();
import studentController from "../controller/studentController";

// students
router.get("/", studentController.index);

router.post("/", studentController.store);

router.put("/:id", studentController.update);

router.delete("/:id", studentController.destroy);

export default router;
