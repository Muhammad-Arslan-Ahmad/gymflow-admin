import sql from "@/app/api/utils/sql";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status");

  let query = "SELECT * FROM membership_plans WHERE 1=1";
  const params = [];

  if (search) {
    params.push(`%${search}%`);
    query += ` AND name ILIKE $${params.length}`;
  }

  if (status) {
    params.push(status);
    query += ` AND status = $${params.length}`;
  }

  query += " ORDER BY price ASC";
  const plans = await sql(query, params);

  return Response.json(plans);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, durationValue, durationUnit, price, status, description } =
      body;

    const result = await sql`
      INSERT INTO membership_plans (name, duration_value, duration_unit, price, status, description)
      VALUES (${name}, ${durationValue}, ${durationUnit}, ${price}, ${status || "ACTIVE"}, ${description})
      RETURNING *
    `;

    await sql`
      INSERT INTO audit_logs (entity_type, entity_id, action, summary)
      VALUES ('MEMBERSHIP_PLAN', ${result[0].id}, 'CREATE', ${`Created membership plan ${name}`})
    `;

    return Response.json(result[0]);
  } catch (error) {
    console.error(error);
    return Response.json(
      { message: "Failed to create membership plan" },
      { status: 500 },
    );
  }
}
