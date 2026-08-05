const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

(async () => {
  let pool;
  try {
    pool = await mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'firstjob',
    });

    const adminEmail = 'admin@firstjob.com';
    const adminPassword = 'Admin@123';

    // Remove existing admin if any
    await pool.query('DELETE FROM users WHERE email = ?', [adminEmail]);

    // Hash password
    const hash = await bcrypt.hash(adminPassword, 10);

    // Insert admin
    await pool.query(
      `INSERT INTO users (email, password_hash, name, role, approval_status, blocked)
       VALUES (?, ?, ?, 'admin', 'approved', false)`,
      [adminEmail, hash, 'Admin']
    );

    // Verify it was saved correctly
    const [rows] = await pool.query('SELECT id, email, name, role, approval_status FROM users WHERE email = ?', [adminEmail]);
    console.log('\n✅ Admin user created successfully!');
    console.log('─────────────────────────────────');
    console.log('  Email    :', adminEmail);
    console.log('  Password :', adminPassword);
    console.log('  Role     :', rows[0].role);
    console.log('  Status   :', rows[0].approval_status);
    console.log('─────────────────────────────────\n');
  } catch (err) {
    console.error('❌ Error creating admin:', err.message);
  } finally {
    if (pool) await pool.end();
    process.exit(0);
  }
})();
