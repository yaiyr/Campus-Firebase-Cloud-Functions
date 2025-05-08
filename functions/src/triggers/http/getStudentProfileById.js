const { onRequest } = require("firebase-functions/v2/https");
const { Pool } = require("pg");

const pool = new Pool({
  connectionString:
    "postgresql://neondb_owner:npg_mQOGqHwl95Cd@ep-old-wind-a1kkjbku-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require",
  ssl: { rejectUnauthorized: false },
});

exports.getStudentProfileById = onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET");

  const { studentNumber } = req.query;

  if (!studentNumber) {
    return res.status(400).json({ error: "Missing studentId" });
  }

  try {
    const result = await pool.query(
      `SELECT 
        up.first_name, 
        up.middle_name, 
        up.last_name, 
        s.student_number, 
        u.email, 
        up.contact_no
      FROM "Student" s
      JOIN "User_Profile" up ON s.user_id = up.user_id
      JOIN "User" u ON s.user_id = u.user_id
      WHERE s.student_number = $1`,
      [studentNumber]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching student profile:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
