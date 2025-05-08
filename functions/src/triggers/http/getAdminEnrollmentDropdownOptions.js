const { onRequest } = require("firebase-functions/v2/https");
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: "postgresql://neondb_owner:npg_mQOGqHwl95Cd@ep-old-wind-a1kkjbku-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require", 
  ssl: { rejectUnauthorized: false },
});

exports.getAdminEnrollmentDropdownOptions = onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  try {
    const departmentFilter = req.query.department;
    const sectionParams = [];

    let sectionQuery = 'SELECT DISTINCT section_desc FROM "Section"';

    if (departmentFilter) {
      sectionQuery += ' WHERE department_id = (SELECT department_id FROM "Department" WHERE department_name ILIKE $1 LIMIT 1)';
      sectionParams.push(`%${departmentFilter}%`);
    }

    console.log("Fetching sections with department filter:", departmentFilter);

    const [deptRes, yearRes, sectionRes] = await Promise.all([
      pool.query('SELECT DISTINCT department_name FROM "Department" ORDER BY department_name'),
      pool.query('SELECT DISTINCT year_level FROM "Section" ORDER BY year_level'),
      pool.query(sectionQuery, sectionParams),
    ]);

    console.log("Sections fetched:", sectionRes.rows);

    res.status(200).json({
      departments: deptRes.rows,
      sections: sectionRes.rows,
      year_levels: yearRes.rows,
    });
  } catch (err) {
    console.error("Dropdown Fetch Error:", err);
    res.status(500).json({ error: "Failed to fetch dropdown options" });
  }
});
