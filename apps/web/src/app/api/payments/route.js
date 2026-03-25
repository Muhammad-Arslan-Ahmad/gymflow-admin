import sql from "@/app/api/utils/sql";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "0");
  const limit = parseInt(searchParams.get("limit") || "10");
  const search = searchParams.get("search") || "";
  const method = searchParams.get("method");
  const status = searchParams.get("status");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const offset = page * limit;

  let query = `
    SELECT p.*, m.first_name, m.last_name 
    FROM payments p 
    JOIN members m ON p.member_id = m.id 
    WHERE 1=1
  `;
  const params = [];

  if (search) {
    params.push(`%${search}%`);
    query += ` AND (m.first_name ILIKE $${params.length} OR m.last_name ILIKE $${params.length} OR p.reference_no ILIKE $${params.length})`;
  }

  if (method) {
    params.push(method);
    query += ` AND p.method = $${params.length}`;
  }

  if (status) {
    params.push(status);
    query += ` AND p.status = $${params.length}`;
  }

  if (startDate) {
    params.push(startDate);
    query += ` AND p.created_at >= $${params.length}`;
  }

  if (endDate) {
    params.push(endDate);
    query += ` AND p.created_at <= $${params.length}`;
  }

  // Count query construction...
  let countQ =
    "SELECT COUNT(*) FROM payments p JOIN members m ON p.member_id = m.id WHERE 1=1";
  const countParams = [];
  if (search) {
    countParams.push(`%${search}%`);
    countQ += ` AND (m.first_name ILIKE $${countParams.length} OR m.last_name ILIKE $${countParams.length} OR p.reference_no ILIKE $${countParams.length})`;
  }
  if (method) {
    countParams.push(method);
    countQ += ` AND p.method = $${countParams.length}`;
  }
  if (status) {
    countParams.push(status);
    countQ += ` AND p.status = $${countParams.length}`;
  }
  if (startDate) {
    countParams.push(startDate);
    countQ += ` AND p.created_at >= $${countParams.length}`;
  }
  if (endDate) {
    countParams.push(endDate);
    countQ += ` AND p.created_at <= $${countParams.length}`;
  }

  const countResult = await sql(countQ, countParams);
  const totalCount = parseInt(countResult[0].count);

  params.push(limit);
  query += ` ORDER BY p.created_at DESC LIMIT $${params.length}`;
  params.push(offset);
  query += ` OFFSET $${params.length}`;

  const payments = await sql(query, params);

  return Response.json({
    data: payments,
    totalCount,
    page,
    limit,
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      memberId,
      amount,
      currency,
      method,
      status,
      receiptUrl,
      referenceNo,
      notes,
      receivedByStaffId,
    } = body;

    const result = await sql`
      INSERT INTO payments (member_id, amount, currency, method, status, receipt_url, reference_no, notes, received_by_staff_id)
      VALUES (${memberId}, ${amount}, ${currency || "PKR"}, ${method}, ${status || "PENDING"}, ${receiptUrl}, ${referenceNo}, ${notes}, ${receivedByStaffId})
      RETURNING *
    `;

    await sql`
      INSERT INTO audit_logs (entity_type, entity_id, action, summary)
      VALUES ('PAYMENT', ${result[0].id}, 'CREATE', ${`Recorded payment of ${amount} for member ID ${memberId}`})
    `;

    return Response.json(result[0]);
  } catch (error) {
    console.error(error);
    return Response.json(
      { message: "Failed to record payment" },
      { status: 500 },
    );
  }
}
