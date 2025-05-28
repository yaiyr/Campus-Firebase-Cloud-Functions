// ✅ Cloud Function: getCourseAdvisingProfile.js
const { onRequest } = require("firebase-functions/v2/https");
const { Client } = require("pg");

exports.getCourseAdvisingProfile = onRequest({
    region: "asia-southeast1",
    cors: true,
  },async (req, res) => {
  const pool = new Client({
    connectionString: "postgresql://neondb_owner:npg_mQOGqHwl95Cd@ep-old-wind-a1kkjbku-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require",
    ssl: { rejectUnauthorized: false },
  });
  await pool.connect();

  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  const { studentNumber } = req.query;

  if (!studentNumber) {
    return res
      .status(400)
      .json({ error: "Missing studentNumber query parameter" });
  }

  try {
    const query = `
      SELECT
  s.student_number,
  s.section_id,
  s.user_id,
  e.department_id,
  up.last_name,
  up.first_name,
  up.middle_name,
  u.email,
  up.contact_no,
  e.student_standing
FROM "Student" s
JOIN "User" u ON s.user_id = u.user_id
JOIN "User_Profile" up ON u.user_id = up.user_id
LEFT JOIN "Enrollment" e ON s.student_id = e.student_id
WHERE s.student_number = $1
  AND e.enrollment_status = 'Not Yet Enrolled'
LIMIT 1;

    `;

    const result = await pool.query(query, [studentNumber]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Student not found or not in 'Not Yet Enrolled' status",
      });
    }

    const row = result.rows[0];

    res.status(200).json({
      student_number: row.student_number,
      department_id: row.department_id,
      user_id: row.user_id,
      section_id: row.section_id,
      first_name: row.first_name,
      middle_name: row.middle_name,
      last_name: row.last_name,
      email: row.email,
      contact_no: row.contact_no,
      student_standing: row.student_standing,
    });
  } catch (err) {
    console.error("ERROR:", err.message);
    return res.status(500).json({ error: err.message });
  }
});
