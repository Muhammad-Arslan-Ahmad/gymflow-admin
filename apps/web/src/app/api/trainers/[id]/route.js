import sql from "@/app/api/utils/sql";

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const result = await sql`SELECT * FROM trainers WHERE id = ${id}`;

    if (result.length === 0) {
      return Response.json({ message: "Trainer not found" }, { status: 404 });
    }

    return Response.json(result[0]);
  } catch (error) {
    console.error(error);
    return Response.json(
      { message: "Failed to fetch trainer" },
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
      gender,
      phone,
      email,
      status,
      specialties,
      photoUrl,
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
    if (gender !== undefined) {
      setClauses.push(`gender = $${paramCount++}`);
      values.push(gender);
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
    if (specialties !== undefined) {
      setClauses.push(`specialties = $${paramCount++}`);
      values.push(specialties);
    }
    if (photoUrl !== undefined) {
      setClauses.push(`photo_url = $${paramCount++}`);
      values.push(photoUrl);
    }

    setClauses.push(`updated_at = NOW()`);
    values.push(id);

    const query = `UPDATE trainers SET ${setClauses.join(", ")} WHERE id = $${paramCount} RETURNING *`;
    const result = await sql(query, values);

    if (result.length === 0) {
      return Response.json({ message: "Trainer not found" }, { status: 404 });
    }

    return Response.json(result[0]);
  } catch (error) {
    console.error(error);
    return Response.json(
      { message: "Failed to update trainer" },
      { status: 500 },
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const result = await sql`DELETE FROM trainers WHERE id = ${id} RETURNING *`;

    if (result.length === 0) {
      return Response.json({ message: "Trainer not found" }, { status: 404 });
    }

    return Response.json({ message: "Trainer deleted successfully" });
  } catch (error) {
    console.error(error);
    return Response.json(
      { message: "Failed to delete trainer" },
      { status: 500 },
    );
  }
}
