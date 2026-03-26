import sql from "@/app/api/utils/sql";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "0");
  const limit = parseInt(searchParams.get("limit") || "10");
  const search = searchParams.get("search") || "";
  const role = searchParams.get("role");
  const status = searchParams.get("status");
  const offset = page * limit;

  let query = "SELECT * FROM staff WHERE 1=1";
  const params = [];

  if (search) {
    params.push(`%${search}%`);
    query += ` AND (first_name ILIKE $${params.length} OR last_name ILIKE $${params.length} OR email ILIKE $${params.length} OR phone ILIKE $${params.length})`;
  }

  if (role) {
    params.push(role);
    query += ` AND role = $${params.length}`;
  }

  if (status) {
    params.push(status);
    query += ` AND status = $${params.length}`;
  }

  const countQuery = query.replace("SELECT *", "SELECT COUNT(*)");
  const countResult = await sql(countQuery, params);
  const totalCount = parseInt(countResult[0].count);

  params.push(limit);
  query += ` ORDER BY created_at DESC LIMIT $${params.length}`;
  params.push(offset);
  query += ` OFFSET $${params.length}`;

  const staff = await sql(query, params);

  return Response.json({
    data: staff,
    totalCount,
    page,
    limit,
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { firstName, lastName, role, phone, email, status } = body;

    const result = await sql`
      INSERT INTO staff (first_name, last_name, role, phone, email, status)
      VALUES (${firstName}, ${lastName}, ${role}, ${phone}, ${email}, ${status || "ACTIVE"})
      RETURNING *
    `;

    await sql`
      INSERT INTO audit_logs (entity_type, entity_id, action, summary)
      VALUES ('STAFF', ${result[0].id}, 'CREATE', ${`Created staff member ${firstName} ${lastName}`})
    `;

    return Response.json(result[0]);
  } catch (error) {
    console.error(error);
    return Response.json(
      { message: "Failed to create staff" },
      { status: 500 },
    );
  }
}
