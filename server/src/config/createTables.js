import "dotenv/config";
import { pool } from "./db.js";

const migrate = async () => {
  const client = await pool.connect();

  try {
    console.log("Creating tables...");

    await client.query("BEGIN");

    // Enable UUID extension
    await client.query(`
      CREATE EXTENSION IF NOT EXISTS "pgcrypto";
    `);

    // Users Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        avatar_url TEXT DEFAULT NULL,
        avatar_public_id TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("users table ready");

    // Projects Table 
    await client.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(200) NOT NULL,
        description TEXT DEFAULT NULL,
        status VARCHAR(20) DEFAULT 'active' 
          CHECK (status IN ('active', 'completed', 'archived')),
        due_date DATE DEFAULT NULL,
        color VARCHAR(7) DEFAULT '#8b5cf6',
        owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("projects table ready");

    // Project Members Table 
    await client.query(`
      CREATE TABLE IF NOT EXISTS project_members (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role VARCHAR(20) DEFAULT 'member'
          CHECK (role IN ('owner', 'member', 'viewer')),
        joined_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(project_id, user_id)
      );
    `);
    console.log("project_members table ready");

    // Tasks Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(200) NOT NULL,
        description TEXT DEFAULT NULL,
        status VARCHAR(20) DEFAULT 'todo'
          CHECK (status IN ('todo', 'in_progress', 'done')),
        priority VARCHAR(20) DEFAULT 'medium'
          CHECK (priority IN ('low', 'medium', 'high')),
        due_date DATE DEFAULT NULL,
        position INTEGER DEFAULT 0,
        project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        assignee_id UUID DEFAULT NULL REFERENCES users(id) ON DELETE SET NULL,
        created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("tasks table ready");

    // Attachments Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS attachments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
        url TEXT NOT NULL,
        public_id TEXT NOT NULL,
        original_name TEXT NOT NULL,
        uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("attachments table ready");

    // Indexes for performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_projects_owner 
        ON projects(owner_id);

      CREATE INDEX IF NOT EXISTS idx_project_members_project 
        ON project_members(project_id);

      CREATE INDEX IF NOT EXISTS idx_project_members_user 
        ON project_members(user_id);

      CREATE INDEX IF NOT EXISTS idx_tasks_project 
        ON tasks(project_id);

      CREATE INDEX IF NOT EXISTS idx_tasks_assignee 
        ON tasks(assignee_id);

      CREATE INDEX IF NOT EXISTS idx_tasks_status 
        ON tasks(status);

      CREATE INDEX IF NOT EXISTS idx_attachments_task 
        ON attachments(task_id);
    `);
    console.log("indexes ready");

    //  Auto update updated_at trigger 
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // Apply trigger to users
    await client.query(`
      DROP TRIGGER IF EXISTS update_users_updated_at ON users;
      CREATE TRIGGER update_users_updated_at
        BEFORE UPDATE ON users
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);

    // Apply trigger to projects
    await client.query(`
      DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
      CREATE TRIGGER update_projects_updated_at
        BEFORE UPDATE ON projects
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);

    // Apply trigger to tasks
    await client.query(`
      DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
      CREATE TRIGGER update_tasks_updated_at
        BEFORE UPDATE ON tasks
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);

    console.log("triggers ready");

    await client.query("COMMIT");
    console.log("All Tables Created successfully!");

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Table creation  failed:", err.message);
    process.exit(1);
  } finally {
    client.release();
    process.exit(0); 
  }
};

migrate();