
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { studentApi } from "./lib/api";
import type { Student, StudentFormData } from "./types/student";
import "./App.css";
import PayButton from "./component/payment";

const emptyForm: StudentFormData = {
  name: "",
  age: undefined,
  gender: "Male",
  email: "",
  phoneNo: "",
  address: "",
};

function App() {
  const [students, setStudents] = useState<Student[]>([]);
  const [form, setForm] = useState<StudentFormData>({ ...emptyForm });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadStudents = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      setStudents(await studentApi.getAll());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load students");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStudents();
  }, [loadStudents]);

  function updateField(
    field: keyof StudentFormData,
    value: string | number | undefined,
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function resetForm() {
    setForm({ ...emptyForm });
    setEditingId(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    const payload: StudentFormData = {
      name: form.name.trim(),
      email: form.email.trim(),
      age: form.age,
      gender: form.gender,
      phoneNo: form.phoneNo?.trim() || undefined,
      address: form.address?.trim() || undefined,
    };

    try {
      if (editingId !== null) {
        await studentApi.update(editingId, payload);
        setNotice("Student updated successfully.");
      } else {
        await studentApi.create(payload);
        setNotice("Student created successfully.");
      }

      resetForm();
      await loadStudents();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  function startEdit(student: Student) {
    setEditingId(student.id);
    setForm({
      name: student.name,
      age: student.age ?? undefined,
      gender: student.gender ?? "Male",
      email: student.email,
      phoneNo: student.phoneNo ?? "",
      address: student.address ?? "",
    });
    setError("");
    setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(student: Student) {
    if (!window.confirm(`Delete ${student.name}?`)) return;

    setError("");
    setNotice("");

    try {
      await studentApi.delete(student.id);

      if (editingId === student.id) resetForm();

      setNotice("Student deleted successfully.");
      await loadStudents();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete student");
    }
  }

  return (
    <main className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">STUDENT MANAGEMENT</p>
          <h1>Student directory</h1>
          <p className="subtitle">
            Manage student records from one place.
          </p>
        </div>

        <div className="count-card">
          <span>Total students</span>
          <strong>{students.length}</strong>
        </div>
      </header>
      <div>
        <PayButton studentId={3} />
      </div>
      {error && <div className="alert error">{error}</div>}
      {notice && <div className="alert success">{notice}</div>}

      <section className="panel">
        <div className="section-heading">
          <div>
            <h2>{editingId !== null ? "Edit student" : "Add a student"}</h2>
            <p>Enter the student's details below.</p>
          </div>

          {editingId !== null && (
            <button className="button secondary" type="button" onClick={resetForm}>
              Cancel edit
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <label>
              Full name *
              <input
                required
                minLength={2}
                maxLength={100}
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="Amit Kumar"
              />
            </label>

            <label>
              Email *
              <input
                required
                type="email"
                maxLength={255}
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="amit@example.com"
              />
            </label>

            <label>
              Age
              <input
                type="number"
                min={1}
                max={120}
                value={form.age ?? ""}
                onChange={(e) =>
                  updateField(
                    "age",
                    e.target.value === "" ? undefined : Number(e.target.value),
                  )
                }
                placeholder="21"
              />
            </label>

            <label>
              Gender
              <select
                value={form.gender ?? "Male"}
                onChange={(e) =>
                  updateField(
                    "gender",
                    e.target.value as StudentFormData["gender"],
                  )
                }
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </label>

            <label>
              Phone number
              <input
                maxLength={20}
                value={form.phoneNo ?? ""}
                onChange={(e) => updateField("phoneNo", e.target.value)}
                placeholder="9876543210"
              />
            </label>

            <label>
              Address
              <input
                maxLength={500}
                value={form.address ?? ""}
                onChange={(e) => updateField("address", e.target.value)}
                placeholder="Ranchi, Jharkhand"
              />
            </label>
          </div>

          <div className="form-actions">
            <button className="button primary" disabled={saving} type="submit">
              {saving
                ? "Saving..."
                : editingId !== null
                  ? "Update student"
                  : "Add student"}
            </button>
          </div>
        </form>
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <h2>All students</h2>
            <p>Student records saved in your MySQL database.</p>
          </div>

          <button
            className="button secondary"
            type="button"
            onClick={() => void loadStudents()}
            disabled={loading}
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {loading ? (
          <p className="empty-state">Loading students...</p>
        ) : students.length === 0 ? (
          <p className="empty-state">No students yet. Add your first student above.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Age / Gender</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {students.map((student) => (
                  <tr key={student.id}>
                    <td>
                      <div className="student-name">{student.name}</div>
                      <div className="student-email">{student.email}</div>
                    </td>
                    <td>
                      {student.age ?? "—"} / {student.gender ?? "—"}
                    </td>
                    <td>{student.phoneNo || "—"}</td>
                    <td>{student.address || "—"}</td>
                    <td>
                      <div className="row-actions">
                        <button
                          className="button small secondary"
                          onClick={() => startEdit(student)}
                          type="button"
                        >
                          Edit
                        </button>
                        <button
                          className="button small danger"
                          onClick={() => void handleDelete(student)}
                          type="button"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

export default App;
