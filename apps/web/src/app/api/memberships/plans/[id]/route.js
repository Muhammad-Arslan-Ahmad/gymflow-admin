import sql from "@/app/api/utils/sql";

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const result = await sql`SELECT * FROM membership_plans WHERE id = ${id}`;

    if (result.length === 0) {
      return Response.json({ message: "Plan not found" }, { status: 404 });
    }

    return Response.json(result[0]);
  } catch (error) {
    console.error(error);
    return Response.json({ message: "Failed to fetch plan" }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, durationValue, durationUnit, price, status, description } =
      body;

    const setClauses = [];
    const values = [];
    let paramCount = 1;

    if (name !== undefined) {
      setClauses.push(`name = $${paramCount++}`);
      values.push(name);
    }
    if (durationValue !== undefined) {
      setClauses.push(`duration_value = $${paramCount++}`);
      values.push(durationValue);
    }
    if (durationUnit !== undefined) {
      setClauses.push(`duration_unit = $${paramCount++}`);
      values.push(durationUnit);
    }
    if (price !== undefined) {
      setClauses.push(`price = $${paramCount++}`);
      values.push(price);
    }
    if (status !== undefined) {
      setClauses.push(`status = $${paramCount++}`);
      values.push(status);
    }
    if (description !== undefined) {
      setClauses.push(`description = $${paramCount++}`);
      values.push(description);
    }

    setClauses.push(`updated_at = NOW()`);
    values.push(id);

    const query = `UPDATE membership_plans SET ${setClauses.join(", ")} WHERE id = $${paramCount} RETURNING *`;
    const result = await sql(query, values);

    if (result.length === 0) {
      return Response.json({ message: "Plan not found" }, { status: 404 });
    }

    return Response.json(result[0]);
  } catch (error) {
    console.error(error);
    return Response.json({ message: "Failed to update plan" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const result =
      await sql`DELETE FROM membership_plans WHERE id = ${id} RETURNING *`;

    if (result.length === 0) {
      return Response.json({ message: "Plan not found" }, { status: 404 });
    }

    return Response.json({ message: "Plan deleted successfully" });
  } catch (error) {
    console.error(error);
    return Response.json({ message: "Failed to delete plan" }, { status: 500 });
  }
}
