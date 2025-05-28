const { onRequest } = require("firebase-functions/v2/https");
const { Client } = require("pg");

exports.getStudentCourseRequests = onRequest(
  {
    region: "asia-southeast1",
    cors: true,
  },
  async (req, res) => {
    const pool = new Client({
      connectionString:
        "postgresql://neondb_owner:npg_mQOGqHwl95Cd@ep-old-wind-a1kkjbku-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require",
      ssl: { rejectUnauthorized: false },
    });
    await pool.connect();

    const {
      department,
      year_level,
      section,
      term,
      academic_year,
      request_type,
      search,
    } = req.query;

    try {
      let query = `
        SELECT 
          scr.request_id,
          scr.student_id,
          scr.enrollment_id,
          scr.course_id,
          scr.request_type,
          scr.reason,
          scr.status,
          up.first_name,
          up.middle_name,
          up.last_name,
          s.student_number,
          c.course_title,
          sec.section_desc,
          sec.year_level,
          e.acad_term,
          e.acad_year,
          d.department_name
        FROM "Student_Course_Requests" scr
        JOIN "Student" s ON scr.student_id = s.student_id
        JOIN "User" u ON u.user_id = s.user_id
        JOIN "User_Profile" up ON up.user_id = u.user_id
        JOIN "Course" c ON scr.course_id = c.course_id
        LEFT JOIN "Enrollment" e ON scr.enrollment_id = e.enrollment_id
        LEFT JOIN "Section" sec ON s.section_id = sec.section_id
        LEFT JOIN "Department" d ON sec.department_id = d.department_id
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
      if (term) {
        values.push(term);
        query += ` AND e.acad_term = $${values.length}`;
      }
      if (academic_year) {
        values.push(academic_year);
        query += ` AND e.acad_year = $${values.length}`;
      }
      if (request_type) {
        values.push(request_type);
        query += ` AND scr.request_type = $${values.length}`;
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

      query += ` ORDER BY scr.request_id`;

      const result = await pool.query(query, values);
      return res.status(200).json(result.rows);
    } catch (err) {
      console.error("ERROR:", err.message);
      return res.status(500).json({ error: err.message });
    }
  }
);
