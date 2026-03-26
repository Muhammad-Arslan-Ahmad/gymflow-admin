import sql from "@/app/api/utils/sql";

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const result = await sql`
      SELECT ic.*, 
        (SELECT COUNT(*) FROM inventory_items WHERE category_id = ic.id) as item_count 
      FROM inventory_categories ic 
      WHERE ic.id = ${id}
    `;

    if (result.length === 0) {
      return Response.json({ message: "Category not found" }, { status: 404 });
    }

    return Response.json(result[0]);
  } catch (error) {
    console.error(error);
    return Response.json(
      { message: "Failed to fetch category" },
      { status: 500 },
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, type, customTypeLabel } = body;

    const setClauses = [];
    const values = [];
    let paramCount = 1;

    if (name !== undefined) {
      setClauses.push(`name = $${paramCount++}`);
      values.push(name);
    }
    if (type !== undefined) {
      setClauses.push(`type = $${paramCount++}`);
      values.push(type);
    }
    if (customTypeLabel !== undefined) {
      setClauses.push(`custom_type_label = $${paramCount++}`);
      values.push(customTypeLabel);
    }

    setClauses.push(`updated_at = NOW()`);
    values.push(id);

    const query = `UPDATE inventory_categories SET ${setClauses.join(", ")} WHERE id = $${paramCount} RETURNING *`;
    const result = await sql(query, values);

    if (result.length === 0) {
      return Response.json({ message: "Category not found" }, { status: 404 });
    }

    return Response.json(result[0]);
  } catch (error) {
    console.error(error);
    return Response.json(
      { message: "Failed to update category" },
      { status: 500 },
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    // Check if category has items
    const itemCheck = await sql`
      SELECT COUNT(*) as count FROM inventory_items WHERE category_id = ${id}
    `;

    if (parseInt(itemCheck[0].count) > 0) {
      return Response.json(
        {
          message:
            "Cannot delete category with existing items. Please reassign or delete items first.",
        },
        { status: 400 },
      );
    }

    const result = await sql`
      DELETE FROM inventory_categories WHERE id = ${id} RETURNING *
    `;

    if (result.length === 0) {
      return Response.json({ message: "Category not found" }, { status: 404 });
    }

    return Response.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error(error);
    return Response.json(
      { message: "Failed to delete category" },
      { status: 500 },
    );
  }
}
