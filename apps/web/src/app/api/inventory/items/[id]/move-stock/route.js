import sql from "@/app/api/utils/sql";

export async function POST(request, { params }) {
  const { id } = params;
  try {
    const body = await request.json();
    const { type, quantity, note, performedById } = body;

    // Use a transaction to update quantity and log movement
    const result = await sql.transaction(async (txn) => {
      // 1. Log movement
      const movement = await txn`
        INSERT INTO inventory_movements (item_id, movement_type, quantity, note, performed_by_id)
        VALUES (${id}, ${type}, ${quantity}, ${note}, ${performedById})
        RETURNING *
      `;

      // 2. Update item quantity
      let updateQuery;
      if (type === "IN") {
        updateQuery = txn`UPDATE inventory_items SET quantity = quantity + ${quantity} WHERE id = ${id} RETURNING *`;
      } else if (type === "OUT") {
        updateQuery = txn`UPDATE inventory_items SET quantity = quantity - ${quantity} WHERE id = ${id} RETURNING *`;
      } else {
        // ADJUST
        updateQuery = txn`UPDATE inventory_items SET quantity = ${quantity} WHERE id = ${id} RETURNING *`;
      }

      const item = await updateQuery;
      return { movement: movement[0], item: item[0] };
    });

    return Response.json(result);
  } catch (error) {
    console.error(error);
    return Response.json({ message: "Failed to move stock" }, { status: 500 });
  }
}
