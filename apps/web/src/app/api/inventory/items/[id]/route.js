import sql from "@/app/api/utils/sql";

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const result = await sql`SELECT * FROM inventory_items WHERE id = ${id}`;

    if (result.length === 0) {
      return Response.json({ message: "Item not found" }, { status: 404 });
    }

    return Response.json(result[0]);
  } catch (error) {
    console.error(error);
    return Response.json({ message: "Failed to fetch item" }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const {
      categoryId,
      name,
      sku,
      quantity,
      unit,
      reorderLevel,
      status,
      purchasePrice,
      salePrice,
      supplier,
      location,
      expiryDate,
      serialNumber,
      warrantyEndDate,
      maintenanceIntervalDays,
      imageUrl,
    } = body;

    const setClauses = [];
    const values = [];
    let paramCount = 1;

    if (categoryId !== undefined) {
      setClauses.push(`category_id = $${paramCount++}`);
      values.push(categoryId);
    }
    if (name !== undefined) {
      setClauses.push(`name = $${paramCount++}`);
      values.push(name);
    }
    if (sku !== undefined) {
      setClauses.push(`sku = $${paramCount++}`);
      values.push(sku);
    }
    if (quantity !== undefined) {
      setClauses.push(`quantity = $${paramCount++}`);
      values.push(quantity);
    }
    if (unit !== undefined) {
      setClauses.push(`unit = $${paramCount++}`);
      values.push(unit);
    }
    if (reorderLevel !== undefined) {
      setClauses.push(`reorder_level = $${paramCount++}`);
      values.push(reorderLevel);
    }
    if (status !== undefined) {
      setClauses.push(`status = $${paramCount++}`);
      values.push(status);
    }
    if (purchasePrice !== undefined) {
      setClauses.push(`purchase_price = $${paramCount++}`);
      values.push(purchasePrice);
    }
    if (salePrice !== undefined) {
      setClauses.push(`sale_price = $${paramCount++}`);
      values.push(salePrice);
    }
    if (supplier !== undefined) {
      setClauses.push(`supplier = $${paramCount++}`);
      values.push(supplier);
    }
    if (location !== undefined) {
      setClauses.push(`location = $${paramCount++}`);
      values.push(location);
    }
    if (expiryDate !== undefined) {
      setClauses.push(`expiry_date = $${paramCount++}`);
      values.push(expiryDate);
    }
    if (serialNumber !== undefined) {
      setClauses.push(`serial_number = $${paramCount++}`);
      values.push(serialNumber);
    }
    if (warrantyEndDate !== undefined) {
      setClauses.push(`warranty_end_date = $${paramCount++}`);
      values.push(warrantyEndDate);
    }
    if (maintenanceIntervalDays !== undefined) {
      setClauses.push(`maintenance_interval_days = $${paramCount++}`);
      values.push(maintenanceIntervalDays);
    }
    if (imageUrl !== undefined) {
      setClauses.push(`image_url = $${paramCount++}`);
      values.push(imageUrl);
    }

    setClauses.push(`updated_at = NOW()`);
    values.push(id);

    const query = `UPDATE inventory_items SET ${setClauses.join(", ")} WHERE id = $${paramCount} RETURNING *`;
    const result = await sql(query, values);

    if (result.length === 0) {
      return Response.json({ message: "Item not found" }, { status: 404 });
    }

    return Response.json(result[0]);
  } catch (error) {
    console.error(error);
    return Response.json({ message: "Failed to update item" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const result =
      await sql`DELETE FROM inventory_items WHERE id = ${id} RETURNING *`;

    if (result.length === 0) {
      return Response.json({ message: "Item not found" }, { status: 404 });
    }

    return Response.json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error(error);
    return Response.json({ message: "Failed to delete item" }, { status: 500 });
  }
}
