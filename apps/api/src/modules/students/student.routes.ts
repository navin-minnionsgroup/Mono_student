
import { Router } from "express";
import * as controller from "./student.controller";

const router = Router();

router.post("/", controller.createStudent);
router.get("/", controller.getAllStudents);
router.get("/:id", controller.getStudentById);
router.patch("/:id", controller.updateStudent);
router.delete("/:id", controller.deleteStudent);

export default router;
