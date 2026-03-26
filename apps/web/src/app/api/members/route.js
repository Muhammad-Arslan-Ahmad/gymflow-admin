import sql from "@/app/api/utils/sql";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "0");
  const limit = parseInt(searchParams.get("limit") || "10");
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status");
  const trainerId = searchParams.get("trainerId");
  const offset = page * limit;

  let query =
    "SELECT m.*, t.first_name as trainer_first_name, t.last_name as trainer_last_name FROM members m LEFT JOIN trainers t ON m.trainer_id = t.id WHERE 1=1";
  const params = [];

  if (search) {
    params.push(`%${search}%`);
    query += ` AND (m.first_name ILIKE $${params.length} OR m.last_name ILIKE $${params.length} OR m.email ILIKE $${params.length} OR m.phone ILIKE $${params.length})`;
  }

  if (status) {
    params.push(status);
    query += ` AND m.status = $${params.length}`;
  }

  if (trainerId) {
    params.push(trainerId);
    query += ` AND m.trainer_id = $${params.length}`;
  }

  const countQuery =
    `SELECT COUNT(*) FROM members m WHERE 1=1` +
    (search
      ? ` AND (m.first_name ILIKE $1 OR m.last_name ILIKE $1 OR m.email ILIKE $1 OR m.phone ILIKE $1)`
      : "") +
    (status ? ` AND m.status = $${search ? 2 : 1}` : "") +
    (trainerId
      ? ` AND m.trainer_id = $${(search ? 1 : 0) + (status ? 1 : 0) + 1}`
      : "");

  // Actually, constructing the count query more robustly:
  let countQ = "SELECT COUNT(*) FROM members m WHERE 1=1";
  const countParams = [];
  if (search) {
    countParams.push(`%${search}%`);
    countQ += ` AND (m.first_name ILIKE $${countParams.length} OR m.last_name ILIKE $${countParams.length} OR m.email ILIKE $${countParams.length} OR m.phone ILIKE $${countParams.length})`;
  }
  if (status) {
    countParams.push(status);
    countQ += ` AND m.status = $${countParams.length}`;
  }
  if (trainerId) {
    countParams.push(trainerId);
    countQ += ` AND m.trainer_id = $${countParams.length}`;
  }

  const countResult = await sql(countQ, countParams);
  const totalCount = parseInt(countResult[0].count);

  params.push(limit);
  query += ` ORDER BY m.created_at DESC LIMIT $${params.length}`;
  params.push(offset);
  query += ` OFFSET $${params.length}`;

  const members = await sql(query, params);

  return Response.json({
    data: members,
    totalCount,
    page,
    limit,
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      phone,
      email,
      gender,
      status,
      trainerId,
      photoUrl,
      signatureUrl,
    } = body;

    const result = await sql`
      INSERT INTO members (first_name, last_name, phone, email, gender, status, trainer_id, photo_url, signature_url)
      VALUES (${firstName}, ${lastName}, ${phone}, ${email}, ${gender}, ${status || "ACTIVE"}, ${trainerId}, ${photoUrl || null}, ${signatureUrl || null})
      RETURNING *
    `;

    await sql`
      INSERT INTO audit_logs (entity_type, entity_id, action, summary)
      VALUES ('MEMBER', ${result[0].id}, 'CREATE', ${`Created member ${firstName} ${lastName}`})
    `;

    return Response.json(result[0]);
  } catch (error) {
    console.error(error);
    return Response.json(
      { message: "Failed to create member" },
      { status: 500 },
    );
  }
}
