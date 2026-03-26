import sql from "@/app/api/utils/sql";

export async function GET() {
  try {
    const today = new Date().toISOString().split("T")[0];
    const firstDayOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1,
    )
      .toISOString()
      .split("T")[0];

    const [memberCount] =
      await sql`SELECT COUNT(*) FROM members WHERE status = 'ACTIVE'`;
    const [subscriptionCount] =
      await sql`SELECT COUNT(*) FROM member_subscriptions WHERE status = 'ACTIVE'`;
    const [revenueToday] =
      await sql`SELECT SUM(amount) FROM payments WHERE status = 'CONFIRMED' AND created_at >= ${today}`;
    const [checkedInCount] =
      await sql`SELECT COUNT(*) FROM attendance WHERE attendance_date = ${today} AND check_out_at IS NULL AND status = 'PRESENT'`;

    // Recent activity
    const recentMembers =
      await sql`SELECT * FROM members ORDER BY created_at DESC LIMIT 5`;
    const recentPayments =
      await sql`SELECT p.*, m.first_name, m.last_name FROM payments p JOIN members m ON p.member_id = m.id ORDER BY p.created_at DESC LIMIT 5`;

    return Response.json({
      stats: {
        totalMembers: parseInt(memberCount.count),
        activeSubscriptions: parseInt(subscriptionCount.count),
        revenueToday: parseFloat(revenueToday.sum || 0),
        currentlyCheckedIn: parseInt(checkedInCount.count),
      },
      recentMembers,
      recentPayments,
    });
  } catch (error) {
    console.error(error);
    return Response.json(
      { message: "Failed to fetch dashboard stats" },
      { status: 500 },
    );
  }
}
