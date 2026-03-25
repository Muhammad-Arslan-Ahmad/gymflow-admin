import sql from "@/app/api/utils/sql";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "0");
  const limit = parseInt(searchParams.get("limit") || "10");
  const search = searchParams.get("search") || "";
  const categoryId = searchParams.get("categoryId");
  const status = searchParams.get("status");
  const stockStatus = searchParams.get("stockStatus"); // 'low', 'out'
  const offset = page * limit;

  let query = `
    SELECT i.*, ic.name as category_name, ic.type as category_type 
    FROM inventory_items i 
    JOIN inventory_categories ic ON i.category_id = ic.id 
    WHERE 1=1
  `;
  const params = [];

  if (search) {
    params.push(`%${search}%`);
    query += ` AND (i.name ILIKE $${params.length} OR i.sku ILIKE $${params.length})`;
  }

  if (categoryId) {
    params.push(categoryId);
    query += ` AND i.category_id = $${params.length}`;
  }

  if (status) {
    params.push(status);
    query += ` AND i.status = $${params.length}`;
  }

  if (stockStatus === "low") {
    query += ` AND i.quantity <= i.reorder_level AND i.quantity > 0`;
  } else if (stockStatus === "out") {
    query += ` AND i.quantity = 0`;
  }

  // Count...
  let countQ = "SELECT COUNT(*) FROM inventory_items i WHERE 1=1";
  const countParams = [];
  if (search) {
    countParams.push(`%${search}%`);
    countQ += ` AND (i.name ILIKE $${countParams.length} OR i.sku ILIKE $${countParams.length})`;
  }
  if (categoryId) {
    countParams.push(categoryId);
    countQ += ` AND i.category_id = $${countParams.length}`;
  }
  if (status) {
    countParams.push(status);
    countQ += ` AND i.status = $${countParams.length}`;
  }
  if (stockStatus === "low") {
    countQ += ` AND i.quantity <= i.reorder_level AND i.quantity > 0`;
  } else if (stockStatus === "out") {
    countQ += ` AND i.quantity = 0`;
  }

  const countResult = await sql(countQ, countParams);
  const totalCount = parseInt(countResult[0].count);

  params.push(limit);
  query += ` ORDER BY i.name ASC LIMIT $${params.length}`;
  params.push(offset);
  query += ` OFFSET $${params.length}`;

  const items = await sql(query, params);

  return Response.json({
    data: items,
    totalCount,
    page,
    limit,
  });
}

export async function POST(request) {
  try {
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

    const result = await sql`
      INSERT INTO inventory_items (
        category_id, name, sku, quantity, unit, reorder_level, status,
        purchase_price, sale_price, supplier, location, expiry_date,
        serial_number, warranty_end_date, maintenance_interval_days, image_url
      )
      VALUES (
        ${categoryId}, ${name}, ${sku}, ${quantity || 0}, ${unit}, ${reorderLevel}, ${status || "ACTIVE"},
        ${purchasePrice}, ${salePrice}, ${supplier}, ${location}, ${expiryDate},
        ${serialNumber}, ${warrantyEndDate}, ${maintenanceIntervalDays}, ${imageUrl}
      )
      RETURNING *
    `;

    return Response.json(result[0]);
  } catch (error) {
    console.error(error);
    return Response.json({ message: "Failed to create item" }, { status: 500 });
  }
}
