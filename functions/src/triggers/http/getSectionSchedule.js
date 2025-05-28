const { onRequest } = require("firebase-functions/v2/https");
const { Client } = require("pg");

exports.getSectionSchedule = onRequest({
    region: "asia-southeast1",
    cors: true,
  },async (req, res) => {
  const pool = new Client({
    connectionString: "postgresql://neondb_owner:npg_mQOGqHwl95Cd@ep-old-wind-a1kkjbku-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require",
    ssl: { rejectUnauthorized: false },
  });
  await pool.connect();

  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).send("");

  const { sectionId } = req.query;

  if (!sectionId) {
    return res.status(400).json({ error: "Missing sectionId parameter" });
  }

  try {
    const query = `
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
      FROM "Timeslot" t
      JOIN "Course" c ON t.course_id = c.course_id
      JOIN "Section" s ON t.section_id = s.section_id
      JOIN "Room" r ON t.room_id = r.room_id
      WHERE t.section_id = $1
      ORDER BY c.course_id, t.weekday;
    `;
    const result = await pool.query(query, [sectionId]);
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error("ERROR:", err.message);
    return res.status(500).json({ error: err.message });
  }
});
