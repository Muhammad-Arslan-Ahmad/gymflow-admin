import sql from "@/app/api/utils/sql";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "0");
  const limit = parseInt(searchParams.get("limit") || "10");
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status");
  const planId = searchParams.get("planId");
  const offset = page * limit;

  let query = `
    SELECT s.*, m.first_name, m.last_name, p.name as plan_name 
    FROM member_subscriptions s 
    JOIN members m ON s.member_id = m.id 
    JOIN membership_plans p ON s.plan_id = p.id 
    WHERE 1=1
  `;
  const params = [];

  if (search) {
    params.push(`%${search}%`);
    query += ` AND (m.first_name ILIKE $${params.length} OR m.last_name ILIKE $${params.length})`;
  }

  if (status) {
    params.push(status);
    query += ` AND s.status = $${params.length}`;
  }

  if (planId) {
    params.push(planId);
    query += ` AND s.plan_id = $${params.length}`;
  }

  let countQ =
    "SELECT COUNT(*) FROM member_subscriptions s JOIN members m ON s.member_id = m.id WHERE 1=1";
  const countParams = [];
  if (search) {
    countParams.push(`%${search}%`);
    countQ += ` AND (m.first_name ILIKE $${countParams.length} OR m.last_name ILIKE $${countParams.length})`;
  }
  if (status) {
    countParams.push(status);
    countQ += ` AND s.status = $${countParams.length}`;
  }
  if (planId) {
    countParams.push(planId);
    countQ += ` AND s.plan_id = $${countParams.length}`;
  }

  const countResult = await sql(countQ, countParams);
  const totalCount = parseInt(countResult[0].count);

  params.push(limit);
  query += ` ORDER BY s.end_date DESC LIMIT $${params.length}`;
  params.push(offset);
  query += ` OFFSET $${params.length}`;

  const subscriptions = await sql(query, params);

  return Response.json({
    data: subscriptions,
    totalCount,
    page,
    limit,
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { memberId, planId, startDate, endDate, status, notes } = body;

    const result = await sql`
      INSERT INTO member_subscriptions (member_id, plan_id, start_date, end_date, status, notes)
      VALUES (${memberId}, ${planId}, ${startDate}, ${endDate}, ${status || "ACTIVE"}, ${notes})
      RETURNING *
    `;

    await sql`
      INSERT INTO audit_logs (entity_type, entity_id, action, summary)
      VALUES ('MEMBER_SUBSCRIPTION', ${result[0].id}, 'CREATE', ${`Assigned plan ID ${planId} to member ID ${memberId}`})
    `;

    return Response.json(result[0]);
  } catch (error) {
    console.error(error);
    return Response.json(
      { message: "Failed to create subscription" },
      { status: 500 },
    );
  }
}
