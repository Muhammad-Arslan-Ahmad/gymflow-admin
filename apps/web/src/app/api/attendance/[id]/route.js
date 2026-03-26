import sql from "@/app/api/utils/sql";

export async function GET(request, { params }) {
  try {
    const { id } = params;

    const result = await sql(
      `SELECT 
        a.*,
        m.first_name as member_first_name,
        m.last_name as member_last_name,
        m.phone as member_phone,
        m.email as member_email,
        t.first_name as trainer_first_name,
        t.last_name as trainer_last_name,
        t.phone as trainer_phone,
        t.email as trainer_email,
        s.first_name as staff_first_name,
        s.last_name as staff_last_name,
        s.phone as staff_phone,
        s.email as staff_email,
        s.role as staff_role,
        staff_marker.first_name as marked_by_first_name,
        staff_marker.last_name as marked_by_last_name
      FROM attendance a
      LEFT JOIN members m ON a.member_id = m.id
      LEFT JOIN trainers t ON a.trainer_id = t.id
      LEFT JOIN staff s ON a.staff_id = s.id
      LEFT JOIN staff staff_marker ON a.marked_by_staff_id = staff_marker.id
      WHERE a.id = $1`,
      [id],
    );

    if (result.length === 0) {
      return Response.json(
        { error: "Attendance record not found" },
        { status: 404 },
      );
    }

    return Response.json(result[0]);
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return Response.json(
      { error: "Failed to fetch attendance record" },
      { status: 500 },
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();

    const updateFields = [];
    const values = [];
    let paramCount = 0;

    const allowedFields = [
      "attendee_type",
      "member_id",
      "trainer_id",
      "staff_id",
      "attendance_date",
      "check_in_at",
      "check_out_at",
      "status",
      "method",
      "notes",
      "marked_by_staff_id",
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        paramCount++;
        updateFields.push(`${field} = $${paramCount}`);
        values.push(body[field]);
      }
    }

    if (updateFields.length === 0) {
      return Response.json({ error: "No fields to update" }, { status: 400 });
    }

    paramCount++;
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await sql(
      `UPDATE attendance 
       SET ${updateFields.join(", ")}
       WHERE id = $${paramCount}
       RETURNING *`,
      values,
    );

    if (result.length === 0) {
      return Response.json(
        { error: "Attendance record not found" },
        { status: 404 },
      );
    }

    return Response.json(result[0]);
  } catch (error) {
    console.error("Error updating attendance:", error);
    return Response.json(
      { error: "Failed to update attendance record" },
      { status: 500 },
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();

    const updateFields = [];
    const values = [];
    let paramCount = 0;

    const allowedFields = [
      "attendee_type",
      "member_id",
      "trainer_id",
      "staff_id",
      "attendance_date",
      "check_in_at",
      "check_out_at",
      "status",
      "method",
      "notes",
      "marked_by_staff_id",
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        paramCount++;
        updateFields.push(`${field} = $${paramCount}`);
        values.push(body[field]);
      }
    }

    if (updateFields.length === 0) {
      return Response.json({ error: "No fields to update" }, { status: 400 });
    }

    paramCount++;
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await sql(
      `UPDATE attendance 
       SET ${updateFields.join(", ")}
       WHERE id = $${paramCount}
       RETURNING *`,
      values,
    );

    if (result.length === 0) {
      return Response.json(
        { error: "Attendance record not found" },
        { status: 404 },
      );
    }

    return Response.json(result[0]);
  } catch (error) {
    console.error("Error updating attendance:", error);
    return Response.json(
      { error: "Failed to update attendance record" },
      { status: 500 },
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    const result = await sql(
      `DELETE FROM attendance WHERE id = $1 RETURNING *`,
      [id],
    );

    if (result.length === 0) {
      return Response.json(
        { error: "Attendance record not found" },
        { status: 404 },
      );
    }

    return Response.json({ message: "Attendance record deleted successfully" });
  } catch (error) {
    console.error("Error deleting attendance:", error);
    return Response.json(
      { error: "Failed to delete attendance record" },
      { status: 500 },
    );
  }
}
