import sql from "@/app/api/utils/sql";

export async function POST(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { frozenFrom, frozenTo, notes } = body;

    // Calculate the freeze duration in days
    const from = new Date(frozenFrom);
    const to = new Date(frozenTo);
    const freezeDays = Math.ceil((to - from) / (1000 * 60 * 60 * 24));

    // Get current subscription
    const current =
      await sql`SELECT * FROM member_subscriptions WHERE id = ${id}`;
    if (current.length === 0) {
      return Response.json(
        { message: "Subscription not found" },
        { status: 404 },
      );
    }

    // Extend end date by freeze duration
    const currentEndDate = new Date(current[0].end_date);
    currentEndDate.setDate(currentEndDate.getDate() + freezeDays);
    const newEndDate = currentEndDate.toISOString().split("T")[0];

    const result = await sql`
      UPDATE member_subscriptions
      SET 
        frozen_from = ${frozenFrom},
        frozen_to = ${frozenTo},
        end_date = ${newEndDate},
        status = 'FROZEN',
        notes = ${notes || current[0].notes},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    await sql`
      INSERT INTO audit_logs (entity_type, entity_id, action, summary)
      VALUES ('MEMBER_SUBSCRIPTION', ${id}, 'FREEZE', ${`Frozen subscription from ${frozenFrom} to ${frozenTo}`})
    `;

    return Response.json(result[0]);
  } catch (error) {
    console.error(error);
    return Response.json(
      { message: "Failed to freeze subscription" },
      { status: 500 },
    );
  }
}
