import sql from "@/app/api/utils/sql";

export async function POST(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { voidReason } = body;

    const result = await sql`
      UPDATE payments
      SET 
        status = 'VOIDED',
        voided_at = NOW(),
        void_reason = ${voidReason},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    await sql`
      INSERT INTO audit_logs (entity_type, entity_id, action, summary)
      VALUES ('PAYMENT', ${id}, 'VOID', ${`Voided payment: ${voidReason}`})
    `;

    return Response.json(result[0]);
  } catch (error) {
    console.error(error);
    return Response.json(
      { message: "Failed to void payment" },
      { status: 500 },
    );
  }
}
