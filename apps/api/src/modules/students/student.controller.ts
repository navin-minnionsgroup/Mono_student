
import type { Request, Response } from "express";
import {
  createStudentSchema,
  updateStudentSchema,
} from "./student.schema";
import * as studentService from "./student.service";

function handleError(res: Response, error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "ER_DUP_ENTRY"
  ) {
    return res.status(409).json({
      success: false,
      message: "A student with this email already exists",
    });
  }

  console.error(error);

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
}

export async function createStudent(
  req: Request,
  res: Response,
) {
  const validation = createStudentSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid student data",
      errors: validation.error.flatten(),
    });
  }

  try {
    const student = await studentService.createStudent(
      validation.data,
    );

    return res.status(201).json({
      success: true,
      message: "Student created successfully",
      data: student,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

export async function getAllStudents(
  _req: Request,
  res: Response,
) {
  try {
    const data = await studentService.getAllStudents();

    return res.json({ success: true, data });
  } catch (error) {
    return handleError(res, error);
  }
}

export async function getStudentById(
  req: Request,
  res: Response,
) {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id < 1) {
    return res.status(400).json({
      success: false,
      message: "Invalid student ID",
    });
  }

  try {
    const student = await studentService.getStudentById(id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    return res.json({ success: true, data: student });
  } catch (error) {
    return handleError(res, error);
  }
}

export async function updateStudent(
  req: Request,
  res: Response,
) {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id < 1) {
    return res.status(400).json({
      success: false,
      message: "Invalid student ID",
    });
  }

  const validation = updateStudentSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid student data",
      errors: validation.error.flatten(),
    });
  }

  try {
    const student = await studentService.getStudentById(id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const updated = await studentService.updateStudent(
      id,
      validation.data,
    );

    return res.json({
      success: true,
      message: "Student updated successfully",
      data: updated,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

export async function deleteStudent(
  req: Request,
  res: Response,
) {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id < 1) {
    return res.status(400).json({
      success: false,
      message: "Invalid student ID",
    });
  }

  try {
    const deleted = await studentService.deleteStudent(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    return res.json({
      success: true,
      message: "Student deleted successfully",
    });
  } catch (error) {
    return handleError(res, error);
  }
}
