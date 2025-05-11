const { onRequest } = require("firebase-functions/v2/https");
const { Pool } = require("pg");

const pool = new Pool({
  connectionString:
    "postgresql://neondb_owner:npg_mQOGqHwl95Cd@ep-old-wind-a1kkjbku-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require",
  ssl: { rejectUnauthorized: false },
});

exports.getEnrollmentStatusByStudentNumber = onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  const studentNumber = req.query.studentNumber;
  if (!studentNumber) {
    return res.status(400).json({ error: "Missing student number" });
  }

  try {
    const result = await pool.query(
      `
        SELECT
          e.acad_term,
          e.acad_year,
          e.enrollment_status
        FROM "Enrollment" e
        JOIN "Student" s ON s.student_id = e.student_id
        WHERE s.student_number = $1
        ORDER BY e.acad_year DESC, e.acad_term DESC
        `,
      [studentNumber]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching enrollment status:", err);
    res.status(500).json({ error: "Failed to fetch enrollment status" });
  }
});
