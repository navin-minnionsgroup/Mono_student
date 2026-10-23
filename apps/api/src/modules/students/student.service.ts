
import { eq } from "drizzle-orm";
import { db } from "../../db";
import { students } from "../../db/schema";
import type {
  CreateStudentInput,
  UpdateStudentInput,
} from "./student.schema";

export async function createStudent(data: CreateStudentInput) {
  await db.insert(students).values({
    name: data.name,
    age: data.age,
    gender: data.gender,
    email: data.email,
    phoneNo: data.phoneNo,
    address: data.address,
  });

  const [student] = await db
    .select()
    .from(students)
    .where(eq(students.email, data.email))
    .limit(1);

  return student;
}

export async function getAllStudents() {
  return db.select().from(students);
}

export async function getStudentById(id: number) {
  const [student] = await db
    .select()
    .from(students)
    .where(eq(students.id, id))
    .limit(1);

  return student ?? null;
}

export async function updateStudent(
  id: number,
  data: UpdateStudentInput,
) {
  await db
    .update(students)
    .set(data)
    .where(eq(students.id, id));

  return getStudentById(id);
}

export async function deleteStudent(id: number) {
  const existing = await getStudentById(id);

  if (!existing) return false;

  await db.delete(students).where(eq(students.id, id));

  return true;
}
