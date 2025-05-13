const { onRequest } = require("firebase-functions/v2/https");
const { Pool } = require("pg");

const pool = new Pool({
  connectionString:
    "postgresql://neondb_owner:npg_mQOGqHwl95Cd@ep-old-wind-a1kkjbku-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require",
  ssl: { rejectUnauthorized: false },
});

exports.adviseStudent = onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).send("");
  }

  console.log("📥 Request body received:", req.body);
  const { user_id, section_id } = req.body;

  if (!user_id || !section_id) {
    return res.status(400).json({ error: "Missing user_id or section_id" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Update the student's section
    await client.query(
      `
      UPDATE "Student"
      SET section_id = $1
      WHERE student_id = $2;
    `,
      [section_id, user_id]
    );

    // 2. Update the enrollment status to 'Advised'
    await client.query(
      `
        UPDATE "Enrollment"
        SET enrollment_status = 'Advised'
        WHERE student_id = (
            SELECT student_id FROM "Student" WHERE user_id = $1 
        )
        AND enrollment_status = 'Not Yet Enrolled';
        `,
      [user_id]
    );

    await client.query("COMMIT");
    res.status(200).json({ message: "Student advised successfully." });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Advise error:", error.message);
    res.status(500).json({ error: "Failed to advise student" });
  } finally {
    client.release();
  }
});
