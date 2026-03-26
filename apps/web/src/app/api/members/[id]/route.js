import sql from "@/app/api/utils/sql";

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const result = await sql`SELECT * FROM members WHERE id = ${id}`;

    if (result.length === 0) {
      return Response.json({ message: "Member not found" }, { status: 404 });
    }

    return Response.json(result[0]);
  } catch (error) {
    console.error(error);
    return Response.json(
      { message: "Failed to fetch member" },
      { status: 500 },
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const {
      firstName,
      lastName,
      phone,
      email,
      gender,
      trainerId,
      status,
      photoUrl,
      signatureUrl,
    } = body;

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
    if (phone !== undefined) {
      setClauses.push(`phone = $${paramCount++}`);
      values.push(phone);
    }
    if (email !== undefined) {
      setClauses.push(`email = $${paramCount++}`);
      values.push(email);
    }
    if (gender !== undefined) {
      setClauses.push(`gender = $${paramCount++}`);
      values.push(gender);
    }
    if (trainerId !== undefined) {
      setClauses.push(`trainer_id = $${paramCount++}`);
      values.push(trainerId);
    }
    if (status !== undefined) {
      setClauses.push(`status = $${paramCount++}`);
      values.push(status);
    }
    if (photoUrl !== undefined) {
      setClauses.push(`photo_url = $${paramCount++}`);
      values.push(photoUrl || null);
    }
    if (signatureUrl !== undefined) {
      setClauses.push(`signature_url = $${paramCount++}`);
      values.push(signatureUrl || null);
    }

    setClauses.push(`updated_at = NOW()`);
    values.push(id);

    const query = `UPDATE members SET ${setClauses.join(", ")} WHERE id = $${paramCount} RETURNING *`;
    const result = await sql(query, values);

    if (result.length === 0) {
      return Response.json({ message: "Member not found" }, { status: 404 });
    }

    return Response.json(result[0]);
  } catch (error) {
    console.error(error);
    return Response.json(
      { message: "Failed to update member" },
      { status: 500 },
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const result = await sql`DELETE FROM members WHERE id = ${id} RETURNING *`;

    if (result.length === 0) {
      return Response.json({ message: "Member not found" }, { status: 404 });
    }

    return Response.json({ message: "Member deleted successfully" });
  } catch (error) {
    console.error(error);
    return Response.json(
      { message: "Failed to delete member" },
      { status: 500 },
    );
  }
}
