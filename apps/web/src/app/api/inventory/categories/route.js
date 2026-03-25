import sql from "@/app/api/utils/sql";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";

  let query =
    "SELECT ic.*, (SELECT COUNT(*) FROM inventory_items WHERE category_id = ic.id) as item_count FROM inventory_categories ic WHERE 1=1";
  const params = [];

  if (search) {
    params.push(`%${search}%`);
    query += ` AND name ILIKE $${params.length}`;
  }

  query += " ORDER BY name ASC";
  const categories = await sql(query, params);

  return Response.json(categories);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, type, customTypeLabel } = body;

    const result = await sql`
      INSERT INTO inventory_categories (name, type, custom_type_label)
      VALUES (${name}, ${type}, ${customTypeLabel})
      RETURNING *
    `;

    return Response.json(result[0]);
  } catch (error) {
    console.error(error);
    return Response.json(
      { message: "Failed to create category" },
      { status: 500 },
    );
  }
}
