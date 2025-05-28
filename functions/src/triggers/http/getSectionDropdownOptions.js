const { onRequest } = require("firebase-functions/v2/https");
const { Client } = require("pg");

exports.getSectionDropdownOptions = onRequest({
    region: "asia-southeast1",
    cors: true,
  },async (req, res) => {
  const pool = new Client({
    connectionString: "postgresql://neondb_owner:npg_mQOGqHwl95Cd@ep-old-wind-a1kkjbku-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require",
    ssl: { rejectUnauthorized: false },
  });
  await pool.connect();

  res.set("Access-Control-Allow-Origin", "*");

  const { departmentId } = req.query;
  if (!departmentId) {
    return res.status(400).json({ error: "Missing departmentId parameter" });
  }

  try {
    const query = `
      SELECT 
        s.section_id,
        s.section_desc AS section_name
        FROM "Section" s
        WHERE s.department_id = $1
        GROUP BY s.section_id, s.section_desc
        ORDER BY s.section_desc;
    `;

    const { rows } = await pool.query(query, [departmentId]);
    const formatted = rows.map((row) => ({
      section_id: row.section_id,
      section_name: row.section_name,
      schedule: row.schedule,
    }));

    res.status(200).json(formatted);
  } catch (error) {
    console.error("Dropdown Fetch Error:", error);
    res.status(500).json({ error: "Failed to fetch section dropdown options" });
  }
});
