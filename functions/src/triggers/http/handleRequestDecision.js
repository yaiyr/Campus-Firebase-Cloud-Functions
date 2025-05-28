const { onRequest } = require("firebase-functions/v2/https");
const { Client } = require("pg");

exports.handleRequestDecision = onRequest(
  {
    region: "asia-southeast1",
    cors: true,
  },
  async (req, res) => {
    const { request_id, action } = req.body; // action = "Approved" or "Rejected"

    if (!request_id || !["Approved", "Rejected"].includes(action)) {
      return res.status(400).json({ error: "Invalid request" });
    }

    const client = new Client({
      connectionString:
        "postgresql://neondb_owner:npg_mQOGqHwl95Cd@ep-old-wind-a1kkjbku-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require",
      ssl: { rejectUnauthorized: false },
    });

    await client.connect();

    try {
      // Step 1: Update status
      await client.query(
        `UPDATE "Student_Course_Requests" SET status = $1 WHERE request_id = $2`,
        [action, request_id]
      );

      // Step 2: Process if Approved
      if (action === "Approved") {
        const result = await client.query(
          `
        SELECT student_id, enrollment_id, course_id, request_type, preferred_section
        FROM "Student_Course_Requests"
        WHERE request_id = $1
      `,
          [request_id]
        );

        const request = result.rows[0];

        if (["Add", "Petition"].includes(request.request_type)) {
          // ✅ Add course
          await client.query(
            `
          INSERT INTO "Irregular_Student_Schedule" (student_id, enrollment_id, course_id, section_id)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (student_id, enrollment_id, course_id) DO NOTHING
        `,
            [
              request.student_id,
              request.enrollment_id,
              request.course_id,
              request.preferred_section || null,
            ]
          );
        }

        if (request.request_type === "Drop") {
          // ❌ Remove course
          await client.query(
            `
          DELETE FROM "Irregular_Student_Schedule"
          WHERE student_id = $1 AND enrollment_id = $2 AND course_id = $3
        `,
            [request.student_id, request.enrollment_id, request.course_id]
          );
        }
      }

      res.status(200).json({ message: `Request ${action}` });
    } catch (err) {
      console.error("❌ Error handling decision:", err.stack);
      res.status(500).json({ error: "Request processing failed." });
    } finally {
      await client.end();
    }
  }
);
