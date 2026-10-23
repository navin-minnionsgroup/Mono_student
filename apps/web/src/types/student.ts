
export interface Student {
  id: number;
  name: string;
  age: number | null;
  gender: "Male" | "Female" | "Other" | null;
  email: string;
  phoneNo: string | null;
  address: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface StudentFormData {
  name: string;
  age?: number;
  gender?: "Male" | "Female" | "Other";
  email: string;
  phoneNo?: string;
  address?: string;
}
