import sql from "@/app/api/utils/sql";
import { hash } from "argon2";

export async function POST(request) {
  if (process.env.NODE_ENV === "production") {
    return Response.json({ error: "Not available in production" }, { status: 403 });
  }

  try {
    // Clear existing data (in reverse order of dependencies)
    await sql`TRUNCATE TABLE audit_logs CASCADE`;
    await sql`TRUNCATE TABLE inventory_movements CASCADE`;
    await sql`TRUNCATE TABLE inventory_items CASCADE`;
    await sql`TRUNCATE TABLE inventory_categories CASCADE`;
    await sql`TRUNCATE TABLE attendance CASCADE`;
    await sql`TRUNCATE TABLE payments CASCADE`;
    await sql`TRUNCATE TABLE member_subscriptions CASCADE`;
    await sql`TRUNCATE TABLE membership_plans CASCADE`;
    await sql`TRUNCATE TABLE members CASCADE`;
    await sql`TRUNCATE TABLE trainers CASCADE`;
    await sql`TRUNCATE TABLE staff CASCADE`;
    await sql`TRUNCATE TABLE auth_accounts CASCADE`;
    await sql`TRUNCATE TABLE auth_sessions CASCADE`;
    await sql`TRUNCATE TABLE auth_users CASCADE`;

    // Reset sequences
    await sql`ALTER SEQUENCE auth_users_id_seq RESTART WITH 1`;
    await sql`ALTER SEQUENCE auth_accounts_id_seq RESTART WITH 1`;
    await sql`ALTER SEQUENCE staff_id_seq RESTART WITH 1`;
    await sql`ALTER SEQUENCE trainers_id_seq RESTART WITH 1`;
    await sql`ALTER SEQUENCE members_id_seq RESTART WITH 1`;
    await sql`ALTER SEQUENCE membership_plans_id_seq RESTART WITH 1`;
    await sql`ALTER SEQUENCE member_subscriptions_id_seq RESTART WITH 1`;
    await sql`ALTER SEQUENCE payments_id_seq RESTART WITH 1`;
    await sql`ALTER SEQUENCE attendance_id_seq RESTART WITH 1`;
    await sql`ALTER SEQUENCE inventory_categories_id_seq RESTART WITH 1`;
    await sql`ALTER SEQUENCE inventory_items_id_seq RESTART WITH 1`;
    await sql`ALTER SEQUENCE inventory_movements_id_seq RESTART WITH 1`;
    await sql`ALTER SEQUENCE audit_logs_id_seq RESTART WITH 1`;

    // AUTH USERS (Admin accounts)
    await sql`
      INSERT INTO auth_users (name, email, "emailVerified") VALUES
      ('Admin User', 'admin@gym.com', NOW()),
      ('Manager User', 'manager@gym.com', NOW()),
      ('Reception Staff', 'reception@gym.com', NOW())
    `;

    const hashedPassword = await hash("admin123");

    await sql`
      INSERT INTO auth_accounts ("userId", type, provider, "providerAccountId", password) VALUES
      (1, 'credentials', 'credentials', 'admin@gym.com', ${hashedPassword}),
      (2, 'credentials', 'credentials', 'manager@gym.com', ${hashedPassword}),
      (3, 'credentials', 'credentials', 'reception@gym.com', ${hashedPassword})
    `;

    // STAFF
    await sql`
      INSERT INTO staff (first_name, last_name, role, status, phone, email, created_at) VALUES
      ('Sarah', 'Johnson', 'MANAGER', 'ACTIVE', '+92-321-1234567', 'sarah.j@gym.com', NOW() - INTERVAL '6 months'),
      ('Mike', 'Chen', 'RECEPTIONIST', 'ACTIVE', '+92-321-2345678', 'mike.c@gym.com', NOW() - INTERVAL '4 months'),
      ('Emma', 'Williams', 'RECEPTIONIST', 'ACTIVE', '+92-321-3456789', 'emma.w@gym.com', NOW() - INTERVAL '3 months'),
      ('David', 'Brown', 'CLEANER', 'ACTIVE', '+92-321-4567890', 'david.b@gym.com', NOW() - INTERVAL '2 months'),
      ('Lisa', 'Garcia', 'MAINTENANCE', 'ACTIVE', '+92-321-5678901', 'lisa.g@gym.com', NOW() - INTERVAL '5 months'),
      ('Tom', 'Anderson', 'RECEPTIONIST', 'INACTIVE', '+92-321-6789012', 'tom.a@gym.com', NOW() - INTERVAL '8 months')
    `;

    // TRAINERS
    await sql`
      INSERT INTO trainers (first_name, last_name, gender, phone, email, status, specialties, created_at) VALUES
      ('Alex', 'Rodriguez', 'MALE', '+92-300-1111111', 'alex.r@gym.com', 'ACTIVE', 'Strength Training, Bodybuilding', NOW() - INTERVAL '2 years'),
      ('Jessica', 'Lee', 'FEMALE', '+92-300-2222222', 'jessica.l@gym.com', 'ACTIVE', 'Yoga, Pilates, Flexibility', NOW() - INTERVAL '1 year'),
      ('Marcus', 'Thompson', 'MALE', '+92-300-3333333', 'marcus.t@gym.com', 'ACTIVE', 'CrossFit, HIIT, Cardio', NOW() - INTERVAL '18 months'),
      ('Sophia', 'Martinez', 'FEMALE', '+92-300-4444444', 'sophia.m@gym.com', 'ACTIVE', 'Weight Loss, Nutrition, Personal Training', NOW() - INTERVAL '1 year'),
      ('James', 'Wilson', 'MALE', '+92-300-5555555', 'james.w@gym.com', 'ACTIVE', 'Sports Training, Athletic Performance', NOW() - INTERVAL '8 months'),
      ('Nina', 'Patel', 'FEMALE', '+92-300-6666666', 'nina.p@gym.com', 'INACTIVE', 'Zumba, Dance Fitness', NOW() - INTERVAL '2 years')
    `;

    // MEMBERSHIP PLANS
    await sql`
      INSERT INTO membership_plans (name, duration_value, duration_unit, price, status, description, created_at) VALUES
      ('Daily Pass', 1, 'DAYS', 500.00, 'ACTIVE', 'Single day access to all gym facilities', NOW() - INTERVAL '1 year'),
      ('Weekly Pass', 1, 'WEEKS', 2500.00, 'ACTIVE', 'One week unlimited access', NOW() - INTERVAL '1 year'),
      ('Monthly Standard', 1, 'MONTHS', 8000.00, 'ACTIVE', 'Monthly membership with full gym access', NOW() - INTERVAL '1 year'),
      ('Quarterly Premium', 3, 'MONTHS', 20000.00, 'ACTIVE', 'Three months + 1 PT session per month', NOW() - INTERVAL '1 year'),
      ('Half Yearly', 6, 'MONTHS', 36000.00, 'ACTIVE', 'Six months membership with locker included', NOW() - INTERVAL '1 year'),
      ('Annual VIP', 1, 'YEARS', 60000.00, 'ACTIVE', 'Full year + PT sessions + nutrition plan', NOW() - INTERVAL '1 year'),
      ('Student Monthly', 1, 'MONTHS', 5000.00, 'ACTIVE', 'Discounted rate for students', NOW() - INTERVAL '6 months'),
      ('Senior Citizen', 1, 'MONTHS', 4000.00, 'ACTIVE', 'Special pricing for seniors (60+)', NOW() - INTERVAL '6 months'),
      ('Corporate Package', 1, 'YEARS', 50000.00, 'INACTIVE', 'Discontinued corporate plan', NOW() - INTERVAL '2 years')
    `;

    // MEMBERS
    await sql`
      INSERT INTO members (first_name, last_name, phone, email, gender, status, trainer_id, created_at) VALUES
      ('Ahmed', 'Khan', '+92-333-1010101', 'ahmed.k@email.com', 'MALE', 'ACTIVE', 1, NOW() - INTERVAL '8 months'),
      ('Fatima', 'Ali', '+92-333-2020202', 'fatima.a@email.com', 'FEMALE', 'ACTIVE', 2, NOW() - INTERVAL '6 months'),
      ('Hassan', 'Malik', '+92-333-3030303', 'hassan.m@email.com', 'MALE', 'ACTIVE', 3, NOW() - INTERVAL '10 months'),
      ('Ayesha', 'Siddiqui', '+92-333-4040404', 'ayesha.s@email.com', 'FEMALE', 'ACTIVE', 4, NOW() - INTERVAL '4 months'),
      ('Usman', 'Ahmed', '+92-333-5050505', 'usman.a@email.com', 'MALE', 'ACTIVE', 5, NOW() - INTERVAL '7 months'),
      ('Zainab', 'Hussain', '+92-333-6060606', 'zainab.h@email.com', 'FEMALE', 'ACTIVE', NULL, NOW() - INTERVAL '3 months'),
      ('Bilal', 'Raza', '+92-333-7070707', 'bilal.r@email.com', 'MALE', 'ACTIVE', NULL, NOW() - INTERVAL '5 months'),
      ('Mariam', 'Sheikh', '+92-333-8080808', 'mariam.s@email.com', 'FEMALE', 'ACTIVE', NULL, NOW() - INTERVAL '2 months'),
      ('Imran', 'Iqbal', '+92-333-9090909', 'imran.i@email.com', 'MALE', 'ACTIVE', NULL, NOW() - INTERVAL '1 year'),
      ('Sana', 'Tariq', '+92-333-1212121', 'sana.t@email.com', 'FEMALE', 'ACTIVE', NULL, NOW() - INTERVAL '9 months'),
      ('Kamran', 'Hashmi', '+92-333-1313131', 'kamran.h@email.com', 'MALE', 'ACTIVE', 1, NOW() - INTERVAL '11 months'),
      ('Hina', 'Farooq', '+92-333-1414141', 'hina.f@email.com', 'FEMALE', 'ACTIVE', 2, NOW() - INTERVAL '2 months'),
      ('Faisal', 'Butt', '+92-333-1515151', 'faisal.b@email.com', 'MALE', 'ACTIVE', NULL, NOW() - INTERVAL '6 months'),
      ('Nida', 'Rahim', '+92-333-1616161', 'nida.r@email.com', 'FEMALE', 'ACTIVE', NULL, NOW() - INTERVAL '4 months'),
      ('Shahid', 'Nawaz', '+92-333-1717171', 'shahid.n@email.com', 'MALE', 'ACTIVE', NULL, NOW() - INTERVAL '1 month'),
      ('Rizwan', 'Chaudhry', '+92-333-1818181', 'rizwan.c@email.com', 'MALE', 'INACTIVE', NULL, NOW() - INTERVAL '2 years'),
      ('Amna', 'Saeed', '+92-333-1919191', 'amna.s@email.com', 'FEMALE', 'INACTIVE', NULL, NOW() - INTERVAL '1 year'),
      ('Junaid', 'Mahmood', '+92-333-2121212', 'junaid.m@email.com', 'MALE', 'INACTIVE', NULL, NOW() - INTERVAL '18 months'),
      ('Sara', 'Aslam', '+92-333-2222221', 'sara.as@email.com', 'FEMALE', 'ACTIVE', NULL, NOW() - INTERVAL '3 weeks'),
      ('Asad', 'Baig', '+92-333-2323232', 'asad.b@email.com', 'MALE', 'ACTIVE', 3, NOW() - INTERVAL '5 days')
    `;

    // MEMBER SUBSCRIPTIONS
    await sql`
      INSERT INTO member_subscriptions (member_id, plan_id, start_date, end_date, status, notes, created_at) VALUES
      (1, 6, '2025-08-01', '2026-08-01', 'ACTIVE', 'Annual VIP member', NOW() - INTERVAL '8 months'),
      (2, 5, '2025-09-15', '2026-03-15', 'ACTIVE', 'Half yearly plan', NOW() - INTERVAL '6 months'),
      (3, 3, '2026-02-01', '2026-03-01', 'ACTIVE', 'Monthly renewal', NOW() - INTERVAL '1 month'),
      (4, 4, '2025-12-01', '2026-03-01', 'ACTIVE', 'Quarterly with PT', NOW() - INTERVAL '4 months'),
      (5, 3, '2025-09-01', '2026-03-01', 'ACTIVE', 'Regular monthly member', NOW() - INTERVAL '6 months'),
      (6, 7, '2026-01-01', '2026-04-01', 'ACTIVE', 'Student discount applied', NOW() - INTERVAL '2 months'),
      (7, 3, '2025-10-15', '2026-04-15', 'ACTIVE', NULL, NOW() - INTERVAL '5 months'),
      (8, 3, '2026-01-15', '2026-04-15', 'ACTIVE', NULL, NOW() - INTERVAL '2 months'),
      (9, 6, '2025-04-01', '2026-04-01', 'ACTIVE', 'Long term member', NOW() - INTERVAL '1 year'),
      (10, 5, '2025-07-01', '2026-01-01', 'ACTIVE', NULL, NOW() - INTERVAL '8 months'),
      (11, 3, '2025-05-15', '2026-05-15', 'ACTIVE', NULL, NOW() - INTERVAL '10 months'),
      (12, 3, '2026-02-01', '2026-03-01', 'ACTIVE', 'New member', NOW() - INTERVAL '1 month'),
      (13, 3, '2025-09-20', '2026-03-20', 'ACTIVE', NULL, NOW() - INTERVAL '6 months'),
      (14, 3, '2025-11-25', '2026-03-25', 'ACTIVE', NULL, NOW() - INTERVAL '4 months'),
      (15, 2, '2026-02-20', '2026-03-27', 'ACTIVE', 'Trial weekly member', NOW() - INTERVAL '1 week'),
      (16, 3, '2024-01-01', '2024-07-01', 'EXPIRED', 'Did not renew', NOW() - INTERVAL '2 years'),
      (17, 5, '2024-06-01', '2024-12-01', 'EXPIRED', 'Membership lapsed', NOW() - INTERVAL '1 year'),
      (18, 3, '2024-08-15', '2025-02-15', 'EXPIRED', 'Not renewed yet', NOW() - INTERVAL '18 months'),
      (19, 2, '2026-03-15', '2026-03-22', 'ACTIVE', 'Weekly trial', NOW() - INTERVAL '1 week'),
      (20, 1, '2026-03-20', '2026-03-21', 'ACTIVE', 'Day pass', NOW() - INTERVAL '3 days')
    `;

    // PAYMENTS
    await sql`
      INSERT INTO payments (member_id, amount, currency, method, status, reference_no, notes, received_by_staff_id, confirmed_at, confirmed_by_id, created_at) VALUES
      (1, 60000.00, 'PKR', 'BANK_TRANSFER', 'CONFIRMED', 'TXN-2025-001', 'Annual VIP membership', 1, NOW() - INTERVAL '8 months', 1, NOW() - INTERVAL '8 months'),
      (2, 36000.00, 'PKR', 'CASH', 'CONFIRMED', 'RCP-2025-045', 'Half yearly payment', 2, NOW() - INTERVAL '6 months', 1, NOW() - INTERVAL '6 months'),
      (3, 8000.00, 'PKR', 'CARD', 'CONFIRMED', 'CARD-2026-012', 'Monthly renewal Feb', 2, NOW() - INTERVAL '1 month', 1, NOW() - INTERVAL '1 month'),
      (4, 20000.00, 'PKR', 'BANK_TRANSFER', 'CONFIRMED', 'TXN-2025-089', 'Quarterly plan', 1, NOW() - INTERVAL '4 months', 1, NOW() - INTERVAL '4 months'),
      (5, 8000.00, 'PKR', 'CASH', 'CONFIRMED', 'RCP-2025-123', 'Monthly payment', 3, NOW() - INTERVAL '6 months', 1, NOW() - INTERVAL '6 months'),
      (6, 5000.00, 'PKR', 'CARD', 'CONFIRMED', 'CARD-2026-001', 'Student membership', 2, NOW() - INTERVAL '2 months', 1, NOW() - INTERVAL '2 months'),
      (7, 8000.00, 'PKR', 'CASH', 'CONFIRMED', 'RCP-2025-156', 'October payment', 2, NOW() - INTERVAL '5 months', 1, NOW() - INTERVAL '5 months'),
      (8, 8000.00, 'PKR', 'BANK_TRANSFER', 'CONFIRMED', 'TXN-2026-003', 'Jan renewal', 2, NOW() - INTERVAL '2 months', 1, NOW() - INTERVAL '2 months'),
      (9, 60000.00, 'PKR', 'CARD', 'CONFIRMED', 'CARD-2025-045', 'Annual membership', 1, NOW() - INTERVAL '1 year', 1, NOW() - INTERVAL '1 year'),
      (10, 36000.00, 'PKR', 'CASH', 'CONFIRMED', 'RCP-2025-078', 'Six month plan', 3, NOW() - INTERVAL '8 months', 1, NOW() - INTERVAL '8 months'),
      (11, 8000.00, 'PKR', 'BANK_TRANSFER', 'PENDING', 'TXN-2026-045', 'Bank transfer pending verification', 2, NULL, NULL, NOW() - INTERVAL '2 days'),
      (12, 8000.00, 'PKR', 'CASH', 'PENDING', NULL, 'Payment being processed', 2, NULL, NULL, NOW() - INTERVAL '1 day'),
      (13, 15000.00, 'PKR', 'CARD', 'REJECTED', 'CARD-2026-099', 'Card declined', 2, NULL, NULL, NOW() - INTERVAL '5 days'),
      (14, 8000.00, 'PKR', 'CASH', 'CONFIRMED', 'RCP-2025-234', 'Monthly payment', 2, NOW() - INTERVAL '4 months', 1, NOW() - INTERVAL '4 months'),
      (15, 2500.00, 'PKR', 'CARD', 'CONFIRMED', 'CARD-2026-088', 'Weekly trial', 3, NOW() - INTERVAL '1 week', 1, NOW() - INTERVAL '1 week'),
      (19, 2500.00, 'PKR', 'CASH', 'CONFIRMED', 'RCP-2026-100', 'Weekly pass', 2, NOW() - INTERVAL '1 week', 1, NOW() - INTERVAL '1 week'),
      (20, 500.00, 'PKR', 'CASH', 'CONFIRMED', 'RCP-2026-105', 'Day pass', 3, NOW() - INTERVAL '3 days', 1, NOW() - INTERVAL '3 days')
    `;

    // ATTENDANCE
    await sql`
      INSERT INTO attendance (member_id, trainer_id, staff_id, attendee_type, attendance_date, check_in_at, check_out_at, status, method, notes, marked_by_staff_id, created_at) VALUES
      (1, NULL, NULL, 'MEMBER', CURRENT_DATE, CURRENT_TIMESTAMP - INTERVAL '3 hours', NULL, 'CHECKED_IN', 'SELF', NULL, NULL, CURRENT_TIMESTAMP - INTERVAL '3 hours'),
      (3, NULL, NULL, 'MEMBER', CURRENT_DATE, CURRENT_TIMESTAMP - INTERVAL '2 hours', NULL, 'CHECKED_IN', 'SELF', NULL, NULL, CURRENT_TIMESTAMP - INTERVAL '2 hours'),
      (5, NULL, NULL, 'MEMBER', CURRENT_DATE, CURRENT_TIMESTAMP - INTERVAL '4 hours', CURRENT_TIMESTAMP - INTERVAL '2 hours 30 minutes', 'CHECKED_OUT', 'SELF', NULL, NULL, CURRENT_TIMESTAMP - INTERVAL '4 hours'),
      (7, NULL, NULL, 'MEMBER', CURRENT_DATE, CURRENT_TIMESTAMP - INTERVAL '1 hour', NULL, 'CHECKED_IN', 'SELF', NULL, NULL, CURRENT_TIMESTAMP - INTERVAL '1 hour'),
      (9, NULL, NULL, 'MEMBER', CURRENT_DATE, CURRENT_TIMESTAMP - INTERVAL '5 hours', CURRENT_TIMESTAMP - INTERVAL '3 hours', 'CHECKED_OUT', 'SELF', 'Morning session', NULL, CURRENT_TIMESTAMP - INTERVAL '5 hours'),
      (NULL, 1, NULL, 'TRAINER', CURRENT_DATE, CURRENT_TIMESTAMP - INTERVAL '6 hours', NULL, 'CHECKED_IN', 'SELF', 'Morning shift', NULL, CURRENT_TIMESTAMP - INTERVAL '6 hours'),
      (NULL, 2, NULL, 'TRAINER', CURRENT_DATE, CURRENT_TIMESTAMP - INTERVAL '5 hours', NULL, 'CHECKED_IN', 'SELF', NULL, NULL, CURRENT_TIMESTAMP - INTERVAL '5 hours'),
      (NULL, 3, NULL, 'TRAINER', CURRENT_DATE, CURRENT_TIMESTAMP - INTERVAL '4 hours', NULL, 'CHECKED_IN', 'SELF', 'Afternoon session', NULL, CURRENT_TIMESTAMP - INTERVAL '4 hours'),
      (NULL, NULL, 2, 'STAFF', CURRENT_DATE, CURRENT_TIMESTAMP - INTERVAL '7 hours', NULL, 'CHECKED_IN', 'SELF', 'Reception duty', NULL, CURRENT_TIMESTAMP - INTERVAL '7 hours'),
      (NULL, NULL, 4, 'STAFF', CURRENT_DATE, CURRENT_TIMESTAMP - INTERVAL '6 hours', CURRENT_TIMESTAMP - INTERVAL '2 hours', 'CHECKED_OUT', 'SELF', 'Cleaning shift', NULL, CURRENT_TIMESTAMP - INTERVAL '6 hours')
    `;

    // INVENTORY CATEGORIES
    await sql`
      INSERT INTO inventory_categories (name, type, custom_type_label, created_at) VALUES
      ('Weight Training Equipment', 'EQUIPMENT', NULL, NOW() - INTERVAL '2 years'),
      ('Cardio Machines', 'EQUIPMENT', NULL, NOW() - INTERVAL '2 years'),
      ('Yoga & Pilates', 'EQUIPMENT', NULL, NOW() - INTERVAL '2 years'),
      ('Protein Supplements', 'SUPPLIES', NULL, NOW() - INTERVAL '2 years'),
      ('Cleaning Supplies', 'SUPPLIES', NULL, NOW() - INTERVAL '2 years'),
      ('Gym Accessories', 'SUPPLIES', NULL, NOW() - INTERVAL '2 years'),
      ('Towels & Linens', 'SUPPLIES', NULL, NOW() - INTERVAL '2 years'),
      ('First Aid', 'SUPPLIES', NULL, NOW() - INTERVAL '2 years'),
      ('Office Supplies', 'OTHER', 'Office/Admin', NOW() - INTERVAL '1 year'),
      ('Merchandise', 'OTHER', 'Retail', NOW() - INTERVAL '1 year')
    `;

    // INVENTORY ITEMS
    await sql`
      INSERT INTO inventory_items (category_id, name, sku, quantity, unit, reorder_level, status, purchase_price, sale_price, supplier, location, created_at) VALUES
      (1, 'Olympic Barbell (20kg)', 'WGT-BAR-001', 15, 'PIECES', 10, 'ACTIVE', 12000.00, NULL, 'FitnessPro Pakistan', 'Weight Room A', NOW() - INTERVAL '2 years'),
      (1, 'Dumbbells Set (5-50kg)', 'WGT-DB-001', 10, 'SETS', 5, 'ACTIVE', 45000.00, NULL, 'FitnessPro Pakistan', 'Weight Room A', NOW() - INTERVAL '2 years'),
      (2, 'Treadmill - ProRun 3000', 'CRD-TM-001', 8, 'PIECES', 6, 'ACTIVE', 150000.00, NULL, 'CardioTech Solutions', 'Cardio Zone', NOW() - INTERVAL '1 year'),
      (2, 'Exercise Bike - SpinMaster', 'CRD-BK-001', 12, 'PIECES', 8, 'ACTIVE', 65000.00, NULL, 'CardioTech Solutions', 'Cardio Zone', NOW() - INTERVAL '1 year'),
      (3, 'Yoga Mat (6mm)', 'YOG-MAT-001', 45, 'PIECES', 20, 'ACTIVE', 1200.00, 2000.00, 'Wellness Imports', 'Yoga Studio', NOW() - INTERVAL '6 months'),
      (4, 'Whey Protein Isolate (2kg)', 'SUP-WPI-001', 45, 'UNITS', 20, 'ACTIVE', 6500.00, 9500.00, 'NutriSports Pakistan', 'Storage Room', NOW() - INTERVAL '2 months'),
      (5, 'Disinfectant Spray (5L)', 'CLN-DIS-001', 12, 'BOTTLES', 8, 'ACTIVE', 1200.00, NULL, 'Metro Wholesale', 'Janitor Closet', NOW() - INTERVAL '2 weeks'),
      (6, 'Gym Gloves (Large)', 'ACC-GLV-L', 15, 'PAIRS', 10, 'ACTIVE', 800.00, 1500.00, 'Sports Gear Co', 'Retail Counter', NOW() - INTERVAL '3 months'),
      (7, 'Gym Towels (Large)', 'TWL-LRG-001', 200, 'PIECES', 100, 'ACTIVE', 250.00, NULL, 'Textile Traders', 'Laundry Room', NOW() - INTERVAL '1 year'),
      (8, 'First Aid Kit', 'MED-FAK-001', 3, 'KITS', 2, 'ACTIVE', 3500.00, NULL, 'Medical Supplies Co', 'Reception', NOW() - INTERVAL '6 months'),
      (9, 'Printer Paper (A4)', 'OFF-PAP-A4', 15, 'REAMS', 10, 'ACTIVE', 600.00, NULL, 'Office Mart', 'Admin Office', NOW() - INTERVAL '1 month'),
      (10, 'Gym T-Shirts (M)', 'MER-TSH-M', 25, 'PIECES', 15, 'ACTIVE', 500.00, 1200.00, 'Apparel Plus', 'Retail Counter', NOW() - INTERVAL '2 months')
    `;

    // INVENTORY MOVEMENTS
    await sql`
      INSERT INTO inventory_movements (item_id, movement_type, quantity, note, performed_by_id, created_at) VALUES
      (1, 'IN', 5.00, 'New stock arrival', 1, NOW() - INTERVAL '3 months'),
      (6, 'IN', 50.00, 'Bulk protein order', 1, NOW() - INTERVAL '2 months'),
      (6, 'OUT', 5.00, 'Member purchase', 2, NOW() - INTERVAL '5 days'),
      (5, 'OUT', 2.00, 'Sold to member', 3, NOW() - INTERVAL '1 week'),
      (7, 'OUT', 2.00, 'Weekly cleaning', 4, NOW() - INTERVAL '1 week')
    `;

    // AUDIT LOGS
    await sql`
      INSERT INTO audit_logs (actor_id, entity_type, entity_id, action, summary, "timestamp") VALUES
      (1, 'MEMBER', 1, 'CREATE', 'Created new member: Ahmed Khan', NOW() - INTERVAL '8 months'),
      (1, 'SUBSCRIPTION', 1, 'CREATE', 'Created annual subscription', NOW() - INTERVAL '8 months'),
      (1, 'PAYMENT', 1, 'CREATE', 'Recorded payment of PKR 60,000', NOW() - INTERVAL '8 months'),
      (1, 'PAYMENT', 1, 'CONFIRM', 'Confirmed payment', NOW() - INTERVAL '8 months'),
      (1, 'TRAINER', 1, 'CREATE', 'Added trainer: Alex Rodriguez', NOW() - INTERVAL '2 years'),
      (1, 'STAFF', 1, 'CREATE', 'Added staff: Sarah Johnson', NOW() - INTERVAL '6 months')
    `;

    // Get summary
    const summary = await sql`
      SELECT
        (SELECT COUNT(*) FROM auth_users) as auth_users,
        (SELECT COUNT(*) FROM staff) as staff,
        (SELECT COUNT(*) FROM trainers) as trainers,
        (SELECT COUNT(*) FROM members) as members,
        (SELECT COUNT(*) FROM membership_plans) as plans,
        (SELECT COUNT(*) FROM member_subscriptions) as subscriptions,
        (SELECT COUNT(*) FROM payments) as payments,
        (SELECT COUNT(*) FROM attendance) as attendance_records,
        (SELECT COUNT(*) FROM inventory_categories) as inventory_categories,
        (SELECT COUNT(*) FROM inventory_items) as inventory_items,
        (SELECT COUNT(*) FROM inventory_movements) as inventory_movements,
        (SELECT COUNT(*) FROM audit_logs) as audit_logs
    `;

    return Response.json({
      success: true,
      message: "Database seeded successfully!",
      summary: summary[0],
    });
  } catch (error) {
    console.error("Seed error:", error);
    return Response.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
