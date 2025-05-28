const { onRequest } = require("firebase-functions/v2/https");
const { Client } = require("pg");

exports.adviseStudent = onRequest({
  region: "asia-southeast1",
  cors: true,
}, async (req, res) => {
  const client = new Client({
    connectionString: "postgresql://neondb_owner:npg_mQOGqHwl95Cd@ep-old-wind-a1kkjbku-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require",
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();

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

  try {
    await client.query("BEGIN");

    // Check if student exists
    const studentResult = await client.query(
      `SELECT student_id FROM "Student" WHERE user_id = $1`,
      [user_id]
    );

    if (studentResult.rowCount === 0) {
      throw new Error(`No student found with user_id: ${user_id}`);
    }

    const student_id = studentResult.rows[0].student_id;

    // Step 1: Update student's section
    await client.query(
      `UPDATE "Student" SET section_id = $1 WHERE user_id = $2`,
      [section_id, user_id]
    );

    // Step 2: Update enrollment status
    await client.query(
      `UPDATE "Enrollment"
       SET enrollment_status = 'Advised'
       WHERE student_id = $1 AND enrollment_status = 'Not Yet Enrolled'`,
      [student_id]
    );

    await client.query("COMMIT");
    res.status(200).json({ message: "Student advised successfully." });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Advise error:", error.stack);
    res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
    });
  } finally {
    await client.end();
  }
});
