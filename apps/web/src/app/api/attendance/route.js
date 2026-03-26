import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "0");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const method = searchParams.get("method") || "";
    const attendeeType = searchParams.get("attendeeType") || "";
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";
    const offset = page * limit;

    let queryParts = [];
    let values = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      queryParts.push(`(
        LOWER(m.first_name) LIKE LOWER($${paramCount}) OR 
        LOWER(m.last_name) LIKE LOWER($${paramCount}) OR
        LOWER(t.first_name) LIKE LOWER($${paramCount}) OR 
        LOWER(t.last_name) LIKE LOWER($${paramCount}) OR
        LOWER(s.first_name) LIKE LOWER($${paramCount}) OR 
        LOWER(s.last_name) LIKE LOWER($${paramCount})
      )`);
      values.push(`%${search}%`);
    }

    if (status) {
      paramCount++;
      queryParts.push(`a.status = $${paramCount}`);
      values.push(status);
    }

    if (method) {
      paramCount++;
      queryParts.push(`a.method = $${paramCount}`);
      values.push(method);
    }

    if (attendeeType) {
      paramCount++;
      queryParts.push(`a.attendee_type = $${paramCount}`);
      values.push(attendeeType);
    }

    if (startDate) {
      paramCount++;
      queryParts.push(`a.attendance_date >= $${paramCount}`);
      values.push(startDate);
    }

    if (endDate) {
      paramCount++;
      queryParts.push(`a.attendance_date <= $${paramCount}`);
      values.push(endDate);
    }

    const whereClause =
      queryParts.length > 0 ? "WHERE " + queryParts.join(" AND ") : "";

    paramCount++;
    const limitParam = paramCount;
    paramCount++;
    const offsetParam = paramCount;

    const query = `
      SELECT 
        a.*,
        m.first_name as member_first_name,
        m.last_name as member_last_name,
        m.phone as member_phone,
        t.first_name as trainer_first_name,
        t.last_name as trainer_last_name,
        t.phone as trainer_phone,
        s.first_name as staff_first_name,
        s.last_name as staff_last_name,
        s.phone as staff_phone,
        s.role as staff_role,
        staff_marker.first_name as marked_by_first_name,
        staff_marker.last_name as marked_by_last_name
      FROM attendance a
      LEFT JOIN members m ON a.member_id = m.id
      LEFT JOIN trainers t ON a.trainer_id = t.id
      LEFT JOIN staff s ON a.staff_id = s.id
      LEFT JOIN staff staff_marker ON a.marked_by_staff_id = staff_marker.id
      ${whereClause}
      ORDER BY a.attendance_date DESC, a.created_at DESC
      LIMIT $${limitParam} OFFSET $${offsetParam}
    `;

    values.push(limit, offset);

    const countQuery = `
      SELECT COUNT(*) as count
      FROM attendance a
      LEFT JOIN members m ON a.member_id = m.id
      LEFT JOIN trainers t ON a.trainer_id = t.id
      LEFT JOIN staff s ON a.staff_id = s.id
      ${whereClause}
    `;

    const [data, countResult] = await Promise.all([
      sql(query, values),
      sql(countQuery, values.slice(0, -2)),
    ]);

    return Response.json({
      data,
      totalCount: parseInt(countResult[0].count),
      page,
      limit,
    });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return Response.json(
      { error: "Failed to fetch attendance records" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      attendee_type,
      member_id,
      trainer_id,
      staff_id,
      attendance_date,
      check_in_at,
      check_out_at,
      status,
      method,
      notes,
      marked_by_staff_id,
    } = body;

    // Validate attendee type and corresponding ID
    if (
      !attendee_type ||
      !["MEMBER", "TRAINER", "STAFF"].includes(attendee_type)
    ) {
      return Response.json(
        { error: "Invalid attendee_type. Must be MEMBER, TRAINER, or STAFF" },
        { status: 400 },
      );
    }

    if (attendee_type === "MEMBER" && !member_id) {
      return Response.json(
        { error: "member_id is required for MEMBER attendance" },
        { status: 400 },
      );
    }

    if (attendee_type === "TRAINER" && !trainer_id) {
      return Response.json(
        { error: "trainer_id is required for TRAINER attendance" },
        { status: 400 },
      );
    }

    if (attendee_type === "STAFF" && !staff_id) {
      return Response.json(
        { error: "staff_id is required for STAFF attendance" },
        { status: 400 },
      );
    }

    if (!attendance_date || !status || !method) {
      return Response.json(
        { error: "attendance_date, status, and method are required" },
        { status: 400 },
      );
    }

    const result = await sql(
      `INSERT INTO attendance (
        attendee_type, member_id, trainer_id, staff_id,
        attendance_date, check_in_at, check_out_at, 
        status, method, notes, marked_by_staff_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        attendee_type,
        attendee_type === "MEMBER" ? member_id : null,
        attendee_type === "TRAINER" ? trainer_id : null,
        attendee_type === "STAFF" ? staff_id : null,
        attendance_date,
        check_in_at || null,
        check_out_at || null,
        status,
        method,
        notes || null,
        marked_by_staff_id || null,
      ],
    );

    return Response.json(result[0], { status: 201 });
  } catch (error) {
    console.error("Error creating attendance:", error);
    return Response.json(
      { error: "Failed to create attendance record" },
      { status: 500 },
    );
  }
}
