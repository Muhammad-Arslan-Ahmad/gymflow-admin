import sql from "@/app/api/utils/sql";

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const result = await sql`SELECT * FROM payments WHERE id = ${id}`;

    if (result.length === 0) {
      return Response.json({ message: "Payment not found" }, { status: 404 });
    }

    return Response.json(result[0]);
  } catch (error) {
    console.error(error);
    return Response.json(
      { message: "Failed to fetch payment" },
      { status: 500 },
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const {
      memberId,
      amount,
      currency,
      method,
      status,
      referenceNo,
      notes,
      receivedByStaffId,
      receiptUrl,
    } = body;

    const setClauses = [];
    const values = [];
    let paramCount = 1;

    if (memberId !== undefined) {
      setClauses.push(`member_id = $${paramCount++}`);
      values.push(memberId);
    }
    if (amount !== undefined) {
      setClauses.push(`amount = $${paramCount++}`);
      values.push(amount);
    }
    if (currency !== undefined) {
      setClauses.push(`currency = $${paramCount++}`);
      values.push(currency);
    }
    if (method !== undefined) {
      setClauses.push(`method = $${paramCount++}`);
      values.push(method);
    }
    if (status !== undefined) {
      setClauses.push(`status = $${paramCount++}`);
      values.push(status);
    }
    if (referenceNo !== undefined) {
      setClauses.push(`reference_no = $${paramCount++}`);
      values.push(referenceNo);
    }
    if (notes !== undefined) {
      setClauses.push(`notes = $${paramCount++}`);
      values.push(notes);
    }
    if (receivedByStaffId !== undefined) {
      setClauses.push(`received_by_staff_id = $${paramCount++}`);
      values.push(receivedByStaffId);
    }
    if (receiptUrl !== undefined) {
      setClauses.push(`receipt_url = $${paramCount++}`);
      values.push(receiptUrl);
    }

    setClauses.push(`updated_at = NOW()`);
    values.push(id);

    const query = `UPDATE payments SET ${setClauses.join(", ")} WHERE id = $${paramCount} RETURNING *`;
    const result = await sql(query, values);

    if (result.length === 0) {
      return Response.json({ message: "Payment not found" }, { status: 404 });
    }

    return Response.json(result[0]);
  } catch (error) {
    console.error(error);
    return Response.json(
      { message: "Failed to update payment" },
      { status: 500 },
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const result = await sql`DELETE FROM payments WHERE id = ${id} RETURNING *`;

    if (result.length === 0) {
      return Response.json({ message: "Payment not found" }, { status: 404 });
    }

    return Response.json({ message: "Payment deleted successfully" });
  } catch (error) {
    console.error(error);
    return Response.json(
      { message: "Failed to delete payment" },
      { status: 500 },
    );
  }
}
