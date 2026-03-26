import sql from "@/app/api/utils/sql";

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const result = await sql`SELECT * FROM staff WHERE id = ${id}`;

    if (result.length === 0) {
      return Response.json({ message: "Staff not found" }, { status: 404 });
    }

    return Response.json(result[0]);
  } catch (error) {
    console.error(error);
    return Response.json({ message: "Failed to fetch staff" }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { firstName, lastName, role, phone, email, status } = body;

    const setClauses = [];
    const values = [];
    let paramCount = 1;

    if (firstName !== undefined) {
      setClauses.push(`first_name = $${paramCount++}`);
      values.push(firstName);
    }
    if (lastName !== undefined) {
      setClauses.push(`last_name = $${paramCount++}`);
      values.push(lastName);
    }
    if (role !== undefined) {
      setClauses.push(`role = $${paramCount++}`);
      values.push(role);
    }
    if (phone !== undefined) {
      setClauses.push(`phone = $${paramCount++}`);
      values.push(phone);
    }
    if (email !== undefined) {
      setClauses.push(`email = $${paramCount++}`);
      values.push(email);
    }
    if (status !== undefined) {
      setClauses.push(`status = $${paramCount++}`);
      values.push(status);
    }

    setClauses.push(`updated_at = NOW()`);
    values.push(id);

    const query = `UPDATE staff SET ${setClauses.join(", ")} WHERE id = $${paramCount} RETURNING *`;
    const result = await sql(query, values);

    if (result.length === 0) {
      return Response.json({ message: "Staff not found" }, { status: 404 });
    }

    return Response.json(result[0]);
  } catch (error) {
    console.error(error);
    return Response.json(
      { message: "Failed to update staff" },
      { status: 500 },
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const result = await sql`DELETE FROM staff WHERE id = ${id} RETURNING *`;

    if (result.length === 0) {
      return Response.json({ message: "Staff not found" }, { status: 404 });
    }

    return Response.json({ message: "Staff deleted successfully" });
  } catch (error) {
    console.error(error);
    return Response.json(
      { message: "Failed to delete staff" },
      { status: 500 },
    );
  }
}
