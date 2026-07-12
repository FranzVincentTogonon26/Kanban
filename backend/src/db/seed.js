import dotenv from "dotenv";
dotenv.config();

import bcrypt from "bcryptjs";
import { pool, withTransaction } from "../config/db.js";

const PASSWORD = "123456";
const DAY = 86400000;
const COLUMNS = ["Todo", "In Progress", "Review", "Done"];

const USERS = [
  {
    key: "franz",
    name: "Franz Vincent",
    email: "franzvincent@gmail.com",
  },
  {
    key: "john",
    name: "John Smith",
    email: "john.smith@gmail.com",
  },
  {
    key: "emma",
    name: "Emma Johnson",
    email: "emma.johnson@gmail.com",
  },
  {
    key: "michael",
    name: "Michael Brown",
    email: "michael.brown@gmail.com",
  },
  {
    key: "sophia",
    name: "Sophia Davis",
    email: "sophia.davis@gmail.com",
  },
  {
    key: "liam",
    name: "Liam Wilson",
    email: "liam.wilson@gmail.com",
  },
  {
    key: "olivia",
    name: "Olivia Martinez",
    email: "olivia.martinez@gmail.com",
  },
  {
    key: "noah",
    name: "Noah Anderson",
    email: "noah.anderson@gmail.com",
  },
  {
    key: "ava",
    name: "Ava Thomas",
    email: "ava.thomas@gmail.com",
  },
  {
    key: "ethan",
    name: "Ethan Taylor",
    email: "ethan.taylor@gmail.com",
  },
  {
    key: "isabella",
    name: "Isabella Moore",
    email: "isabella.moore@gmail.com",
  },
];

const BOARDS = [
  {
    title: "Mobile App Launch",
    description: "Ship the iOS & Android apps to the stores",
    color: "#c26a45",
    owner: "franz",
    members: ["ethan", "isabella"],
    updatedDaysAgo: 1.2,
    tasks: [
      "App store listing copy",
      "Push notification setup",
      "Crash reporting integration",
      "Onboarding screens",
      "Deep linking",
      "Release checklist",
      "App icon polish",
    ],
  },
  {
    title: "Website Redesign",
    description: "Modernize the company website",
    color: "#4f46e5",
    owner: "john",
    members: ["emma", "olivia"],
    updatedDaysAgo: 2,
    tasks: [
      "Create wireframes",
      "Design landing page",
      "Update typography",
      "Optimize images",
      "Responsive testing",
    ],
  },
  {
    title: "Marketing Campaign",
    description: "Launch Q4 digital marketing campaign",
    color: "#10b981",
    owner: "emma",
    members: ["michael", "ava"],
    updatedDaysAgo: 0.5,
    tasks: [
      "Facebook ads",
      "Google Ads",
      "Email newsletter",
      "Campaign analytics",
    ],
  },
  {
    title: "CRM Migration",
    description: "Move customer data to new CRM",
    color: "#f59e0b",
    owner: "michael",
    members: ["john", "liam"],
    updatedDaysAgo: 4,
    tasks: [
      "Export contacts",
      "Clean duplicate records",
      "Import to CRM",
      "Validate data",
    ],
  },
  {
    title: "E-Commerce Platform",
    description: "Develop the new online store",
    color: "#ef4444",
    owner: "sophia",
    members: ["franz", "ethan"],
    updatedDaysAgo: 1,
    tasks: [
      "Shopping cart",
      "Payment gateway",
      "Product catalog",
      "Checkout flow",
    ],
  },
  {
    title: "Customer Support Portal",
    description: "Improve customer self-service",
    color: "#06b6d4",
    owner: "liam",
    members: ["emma", "isabella"],
    updatedDaysAgo: 3.2,
    tasks: ["Knowledge base", "FAQ updates", "Live chat", "Ticket dashboard"],
  },
  {
    title: "HR Recruitment",
    description: "Hire engineers and designers",
    color: "#8b5cf6",
    owner: "olivia",
    members: ["ava", "john"],
    updatedDaysAgo: 5,
    tasks: [
      "Review resumes",
      "Schedule interviews",
      "Technical exams",
      "Offer letters",
    ],
  },
  {
    title: "Finance Dashboard",
    description: "Build executive reporting dashboard",
    color: "#14b8a6",
    owner: "ethan",
    members: ["franz", "michael"],
    updatedDaysAgo: 2.8,
    tasks: [
      "Revenue charts",
      "Expense reports",
      "Export PDF",
      "User permissions",
    ],
  },
  {
    title: "Cloud Migration",
    description: "Move infrastructure to the cloud",
    color: "#0ea5e9",
    owner: "isabella",
    members: ["liam", "sophia"],
    updatedDaysAgo: 6,
    tasks: [
      "Provision servers",
      "Configure DNS",
      "Database migration",
      "Load testing",
    ],
  },
  {
    title: "AI Chatbot",
    description: "Build an AI assistant for customer support",
    color: "#6366f1",
    owner: "franz",
    members: ["emma", "ethan"],
    updatedDaysAgo: 0.8,
    tasks: [
      "Prompt engineering",
      "Conversation flow",
      "API integration",
      "Feedback collection",
    ],
  },
  {
    title: "Inventory Management",
    description: "Track warehouse inventory",
    color: "#84cc16",
    owner: "ava",
    members: ["john", "michael"],
    updatedDaysAgo: 7,
    tasks: [
      "Barcode scanning",
      "Stock alerts",
      "Supplier records",
      "Monthly reports",
    ],
  },
  {
    title: "Security Audit",
    description: "Review application security",
    color: "#dc2626",
    owner: "noah",
    members: ["franz", "isabella"],
    updatedDaysAgo: 1.5,
    tasks: [
      "Dependency audit",
      "Penetration testing",
      "Fix vulnerabilities",
      "Security report",
    ],
  },
  {
    title: "Analytics Platform",
    description: "Centralize product analytics",
    color: "#9333ea",
    owner: "michael",
    members: ["olivia", "noah"],
    updatedDaysAgo: 3.5,
    tasks: [
      "Event tracking",
      "Dashboard widgets",
      "Retention metrics",
      "Funnels",
    ],
  },
  {
    title: "Learning Management System",
    description: "Create internal employee training portal",
    color: "#0891b2",
    owner: "isabella",
    members: ["emma", "ava"],
    updatedDaysAgo: 2.3,
    tasks: [
      "Course builder",
      "Quiz module",
      "Certificates",
      "Progress tracking",
    ],
  },
  {
    title: "DevOps Automation",
    description: "Automate CI/CD and deployments",
    color: "#16a34a",
    owner: "ethan",
    members: ["franz", "liam", "noah"],
    updatedDaysAgo: 0.3,
    tasks: [
      "GitHub Actions",
      "Docker builds",
      "Kubernetes deployment",
      "Monitoring",
      "Rollback strategy",
    ],
  },
];

const COL_CYCLE = [0, 1, 1, 2, 3, 0, 2, 3, 1, 3, 0, 1];
const PRIO_CYCLE = [
  "medium",
  "high",
  "low",
  "urgent",
  "medium",
  "high",
  "low",
  "urgent",
];
// prettier-ignore
const DUE_CYCLE = [-9,2,null,5,-2,14,1,null,20,-4,6,9,3,null,12,-1,7]

const run = async () => {
  await withTransaction(async (c) => {
    await c.query("DELETE FROM users WHERE email = ANY($1)", [
      USERS.map((u) => u.email.toLowerCase()),
    ]);

    const hash = await bcrypt.hash(PASSWORD, 10);
    const uid = {};

    for (const u of USERS) {
      const { rows } = await c.query(
        `
            INSERT INTO users ( name, email, password_hash, created_at )
            VALUES ( $1, $2, $3, now() - interval '60 days')
            RETURNING id`,
        [u.name, u.email.toLowerCase(), hash],
      );
      uid[u.key] = rows[0].id;
    }

    let taskTotal = 0;

    for (const b of BOARDS) {
      const ownerId = uid[b.owner];
      const updatedAt = new Date(Date.now() - b.updatedDaysAgo * DAY);

      const { rows: br } = await c.query(
        `
            INSERT INTO boards ( title, description, color, owner_id, created_at, updated_at )
            VALUES ( $1, $2, $3, $4, now() - interval '45 days', $5 )
            RETURNING id`,
        [b.title, b.description, b.color, ownerId, updatedAt],
      );

      const boardId = br[0].id;

      let memberKeys = [b.owner, ...b.members];
      if (!memberKeys.includes("franz")) memberKeys.push("franz");
      memberKeys = [...new Set(memberKeys)];

      for (let mi = 0; mi < memberKeys.length; mi++) {
        const mk = memberKeys[mi];
        const role = mk === b.owner ? "owner" : mi === 1 ? "admin" : "member";
        await c.query(
          `
            INSERT INTO board_members ( board_id, user_id, role )
            VALUES ( $1, $2, $3 ) ON CONFLICT DO NOTHING`,
          [boardId, uid[mk], role],
        );
      }

      const colIds = [];
      for (let i = 0; i < COLUMNS.length; i++) {
        const { rows: cr } = await c.query(
          `
            INSERT INTO columns ( board_id, title, position ) VALUES ( $1, $2, $3 ) RETURNING id`,
          [boardId, COLUMNS[i], (i + 1) * 1000],
        );
        colIds.push(cr[0].id);
      }

      const assignPool = ["franz", "franz", ...memberKeys];

      for (let i = 0; i < b.tasks.length; i++) {
        const colIdx = COL_CYCLE[i % COL_CYCLE.length];
        const priority = PRIO_CYCLE[(i + b.title.length) % PRIO_CYCLE.length];
        const offset = DUE_CYCLE[(i + b.tasks.length) % DUE_CYCLE.length];
        // prettier-ignore
        const dueDate = offset === null ? null : new Date(Date.now() + offset * DAY);
        // prettier-ignore
        const assignKey = i % 5 === 4 ? null : assignPool[ i % assignPool.length ];
        const assigneeId = assignKey ? uid[assignKey] : null;

        await c.query(
          `
            INSERT INTO tasks
                ( board_id, column_id, title, description, priority, due_date, assigned_id, position, created_by, created_at, updated_at )
            VALUES ( $1, $2, $3, $4, $5, $6, $7, $8, $9, now() - interval '20 days', $10 )`,
          [
            boardId,
            colIds[colIdx],
            b.tasks[i],
            // prettier-ignore
            i % 3 === 0 ? `${b.tasks[i]} - details and acceptance criteria.` : null,
            priority,
            dueDate,
            assigneeId,
            (i + 1) * 1000,
            ownerId,
            updatedAt,
          ],
        );

        taskTotal += 1;
      }

      const ownerName = USERS.find((u) => u.key === b.owner).name;
      const acts = [
        // prettier-ignore
        { action: "board.created", message: `${ownerName} created the board` },
        // prettier-ignore
        { action: "task.created", message: `${ownerName} added "${b.tasks[0]}"` },
        // prettier-ignore
        { action: "task.moved", message: `${USERS.find((u) => u.key === memberKeys[1] || u.key === b.owner )?.name || ownerName } moved "${b.tasks[Math.min( 3, b.tasks.length - 1 )]}" to Done` },
      ];

      for (let ai = 0; ai < acts.length; ai++) {
        // prettier-ignore
        await c.query(`
            INSERT INTO activities ( board_id, user_id, action, message, created_at )
            VALUES ( $1, $2, $3, $4, now() - ( $5 || ' hours')::interval)`,
          [boardId, ownerId, acts[ai].action, acts[ai].message, (ai + 1) * 7],
        );
      }
    }

    return taskTotal;
  }).then((taskTotal) => {
    console.log("✅ Demo workspace seeded");
    // prettier-ignore
    console.log(`Users: ${USERS.length} - Boards: ${BOARDS.length} - Tasks: ${taskTotal}`)
    console.log("Login: franzvincent@gmail.com / 123456");
    console.log("(teammates share the same password)");
  });
};

run()
  .catch((err) => {
    console.log("❌ Seed failed:", err.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
