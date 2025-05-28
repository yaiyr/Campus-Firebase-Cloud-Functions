const { onRequest } = require("firebase-functions/v2/https");
const { Client } = require("pg");

exports.getAdminEnrollmentStudentList = onRequest(
  {
    region: "asia-southeast1",
    cors: true,
  },
  async (req, res) => {
    const db = new Client({
      connectionString:
        "postgresql://neondb_owner:npg_mQOGqHwl95Cd@ep-old-wind-a1kkjbku-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require",
      ssl: { rejectUnauthorized: false },
    });

    try {
      await db.connect();

      res.set("Access-Control-Allow-Origin", "*");
      res.set("Access-Control-Allow-Methods", "GET");
      res.set("Access-Control-Allow-Headers", "Content-Type");

      const {
        department,
        year_level,
        section,
        term,
        academic_year,
        enrollment_status,
        search,
      } = req.query;

      const values = [];
      const conditions = [];

      if (department) {
        values.push(department);
        conditions.push(`d.department_name ILIKE $${values.length}`);
      }

      if (year_level) {
        values.push(year_level);
        conditions.push(`sec.year_level = $${values.length}`);
      }

      if (section) {
        values.push(section);
        conditions.push(`sec.section_desc ILIKE $${values.length}`);
      }

      if (term) {
        values.push(term);
        conditions.push(`e.acad_term = $${values.length}`);
      }

      if (academic_year) {
        values.push(academic_year);
        conditions.push(`e.acad_year = $${values.length}`);
      }

      if (enrollment_status) {
        values.push(enrollment_status);
        conditions.push(`e.enrollment_status = $${values.length}`);
      }

      if (search) {
        values.push(`%${search}%`);
        conditions.push(`(
    s.student_number::text ILIKE $${values.length} OR
    up.last_name ILIKE $${values.length} OR
    up.first_name ILIKE $${values.length}
  )`);
      }
      
      const whereClause =
        conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

      const query = `
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
        ${whereClause}
        ORDER BY up.last_name, up.first_name
      `;

      const result = await db.query(query, values);

      res.status(200).json(result.rows);
    } catch (err) {
      console.error("❌ Enrollment Fetch Error:", err.stack);
      res.status(500).json({
        error: "Internal Server Error",
        message: err.message,
      });
    } finally {
      await db.end();
    }
  }
);
