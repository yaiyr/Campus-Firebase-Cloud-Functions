const { onRequest } = require("firebase-functions/v2/https");
const { Client } = require("pg");

exports.getFullStudentSchedule = onRequest({ cors: true }, async (req, res) => {
  const { student_id, enrollment_id } = req.query;

  if (!student_id || !enrollment_id) {
    return res.status(400).json({ error: "Missing student_id or enrollment_id" });
  }

  const pool = new Client({
    connectionString: "postgresql://neondb_owner:npg_mQOGqHwl95Cd@ep-old-wind-a1kkjbku-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require",
    ssl: { rejectUnauthorized: false },
  });
  await pool.connect();

  try {
    const result = await pool.query(`
      -- Regular section schedule
      SELECT 
        c.course_id AS subject,
        c.course_title AS description,
        c.lec_units AS lecture,
        c.lab_units AS laboratory,
        s.section_desc AS section,
        CONCAT(
          t.weekday, ' - ',
          TO_CHAR(t.timeslot_start, 'HH12:MI AM'), ' - ',
          TO_CHAR(t.timeslot_end, 'HH12:MI AM'), ' - ',
          r.floor_no, ' - Room ', r.room_no, ' - ', r.building
        ) AS schedule
      FROM "Student" stu
      JOIN "Section" s ON stu.section_id = s.section_id
      JOIN "Timeslot" t ON s.section_id = t.section_id
      JOIN "Course" c ON t.course_id = c.course_id
      JOIN "Room" r ON t.room_id = r.room_id
      WHERE stu.student_id = $1

      UNION

      -- Irregular schedule
      SELECT 
        c.course_id AS subject,
        c.course_title AS description,
        c.lec_units AS lecture,
        c.lab_units AS laboratory,
        s.section_desc AS section,
        CONCAT(
          t.weekday, ' - ',
          TO_CHAR(t.timeslot_start, 'HH12:MI AM'), ' - ',
          TO_CHAR(t.timeslot_end, 'HH12:MI AM'), ' - ',
          r.floor_no, ' - Room ', r.room_no, ' - ', r.building
        ) AS schedule
      FROM "Irregular_Student_Schedule" iss
      JOIN "Course" c ON iss.course_id = c.course_id
      JOIN "Section" s ON iss.section_id = s.section_id
      JOIN "Timeslot" t ON s.section_id = t.section_id AND t.course_id = c.course_id
      JOIN "Room" r ON t.room_id = r.room_id
      WHERE iss.student_id = $1 AND iss.enrollment_id = $2

      ORDER BY subject, schedule;
    `, [student_id, enrollment_id]);

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Schedule fetch error:", err.stack);
    res.status(500).json({ error: "Failed to fetch full schedule." });
  } finally {
    await pool.end();
  }
});
