const { onRequest } = require("firebase-functions/v2/https");
const { Pool } = require("pg");

const pool = new Pool({
  connectionString:
    "postgresql://neondb_owner:npg_mQOGqHwl95Cd@ep-old-wind-a1kkjbku-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require",
  ssl: { rejectUnauthorized: false },
});

exports.getAdminEnrollmentStudentList = onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).send("");
  }
  try {
    const { department, year_level, section, term, academic_year, search } = req.query;

    let query = `
  SELECT
    s.student_number,
    up.last_name,
    up.first_name,
    up.middle_name,
    e.enrollment_status,
    sec.section_desc,
    sec.year_level,
    d.department_name
  FROM "Student" s
  JOIN "User" u ON s.user_id = u.user_id
  JOIN "User_Profile" up ON u.user_id = up.user_id
  LEFT JOIN "Section" sec ON s.section_id = sec.section_id
  LEFT JOIN "Department" d ON sec.department_id = d.department_id
  LEFT JOIN "Enrollment" e ON s.student_id = e.student_id
  WHERE 1=1
`;
    const values = [];

    if (department) {
      values.push(department);
      query += ` AND d.department_name = $${values.length}`;
    }

    if (year_level) {
      values.push(year_level);
      query += ` AND sec.year_level = $${values.length}`;
    }

    if (section) {
      values.push(section);
      query += ` AND sec.section_desc = $${values.length}`;
    }

    if (search) {
      values.push(`%${search}%`);
      const i = values.length;
      query += ` AND (
          up.first_name ILIKE $${i} OR
          up.middle_name ILIKE $${i} OR
          up.last_name ILIKE $${i} OR
          CAST(s.student_number AS TEXT) ILIKE $${i} OR
          CAST(sec.section_desc AS TEXT) ILIKE $${i} OR
          CAST(d.department_name AS TEXT) ILIKE $${i}
        )`;
    }

    if (term) {
      values.push(term);
      query += ` AND e.acad_term = $${values.length}`;
    }
    
    if (academic_year) {
      values.push(academic_year);
      query += ` AND e.acad_year = $${values.length}`;
    }    

    const result = await pool.query(query, values);
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error("ERROR:", err.message);
    console.error("STACK:", err.stack);
    return res.status(500).json({ error: err.message });
  }
});
