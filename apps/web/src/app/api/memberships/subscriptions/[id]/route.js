import sql from "@/app/api/utils/sql";

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const result =
      await sql`SELECT * FROM member_subscriptions WHERE id = ${id}`;

    if (result.length === 0) {
      return Response.json(
        { message: "Subscription not found" },
        { status: 404 },
      );
    }

    return Response.json(result[0]);
  } catch (error) {
    console.error(error);
    return Response.json(
      { message: "Failed to fetch subscription" },
      { status: 500 },
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { memberId, planId, startDate, endDate, status, notes } = body;

    const setClauses = [];
    const values = [];
    let paramCount = 1;

    if (memberId !== undefined) {
      setClauses.push(`member_id = $${paramCount++}`);
      values.push(memberId);
    }
    if (planId !== undefined) {
      setClauses.push(`plan_id = $${paramCount++}`);
      values.push(planId);
    }
    if (startDate !== undefined) {
      setClauses.push(`start_date = $${paramCount++}`);
      values.push(startDate);
    }
    if (endDate !== undefined) {
      setClauses.push(`end_date = $${paramCount++}`);
      values.push(endDate);
    }
    if (status !== undefined) {
      setClauses.push(`status = $${paramCount++}`);
      values.push(status);
    }
    if (notes !== undefined) {
      setClauses.push(`notes = $${paramCount++}`);
      values.push(notes);
    }

    setClauses.push(`updated_at = NOW()`);
    values.push(id);

    const query = `UPDATE member_subscriptions SET ${setClauses.join(", ")} WHERE id = $${paramCount} RETURNING *`;
    const result = await sql(query, values);

    if (result.length === 0) {
      return Response.json(
        { message: "Subscription not found" },
        { status: 404 },
      );
    }

    return Response.json(result[0]);
  } catch (error) {
    console.error(error);
    return Response.json(
      { message: "Failed to update subscription" },
      { status: 500 },
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const result =
      await sql`DELETE FROM member_subscriptions WHERE id = ${id} RETURNING *`;

    if (result.length === 0) {
      return Response.json(
        { message: "Subscription not found" },
        { status: 404 },
      );
    }

    return Response.json({ message: "Subscription deleted successfully" });
  } catch (error) {
    console.error(error);
    return Response.json(
      { message: "Failed to delete subscription" },
      { status: 500 },
    );
  }
}
