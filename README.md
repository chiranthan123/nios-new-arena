# LiteraTrack

> **Educational Management & Academic Attendance Tracking Application for NIOS Learning Centres**

LiteraTrack is a production-structured web application purpose-built for learning centres supporting **National Institute of Open Schooling (NIOS)** secondary (Class 10) and senior secondary (Class 12) learners.

---

## 🌟 Key Capabilities & Features

### 1. Role-Based Access Control (RBAC)
- **Administrator**: Institutional enrollment, student admissions with automated ID generation (`STU-YYYY-XXXX`), faculty onboarding (`TCH-YYYY-XXXX`), subject curriculum mapping, class audits, demo dataset controls, and database migration management.
- **Teacher (Educator)**: Course session scheduling with automatic duration calculation and overlap warnings, automated eligible student selection based on enrolled subjects & grade levels, attendance logging (`Present`, `Absent`, `Late` with 5-30 min or custom delays), and four-view attendance management with immutable audit logs.
- **Student (Learner)**: Real-time academic tracking, enrolled curriculum subjects, attendance percentages calculated using the official NIOS formula `(Present + Late) / Total Conducted Classes * 100`, class history, and personal profile (read-only per academic safety standards).

### 2. Intelligent Data Layer & Resilience
- **Dual-Engine Architecture**: Connects directly to **Supabase PostgreSQL** with Row Level Security (RLS). When database tables are awaiting migration, an intelligent resilient data layer provides full-fidelity local state management with isolated demonstration data so every workflow runs smoothly.
- **Dedicated Demo Mode**: Toggleable from the Administrator dashboard (`DEMO MODE: ON / OFF`) with clear visual badges. Demo records never contaminate or skew authentic learner records.

---

## 🏗️ Technology Stack

- **Framework**: Next.js 16 (App Router) with TypeScript & React 19
- **Styling**: Tailwind CSS v4 & Lucide Icons
- **Backend & Auth**: Supabase PostgreSQL, Supabase Authentication, Supabase Row Level Security (RLS)
- **Analytics & Math**: Mathematical attendance percentage engine, Recharts-ready data structures
- **Deployment**: Vercel ready

---

## 🚀 Getting Started

### 1. Clone & Install Dependencies

\`\`\`bash
git clone https://github.com/chiranthan123/nios-new-arena.git
cd nios-new-arena
npm install
\`\`\`

### 2. Configure Environment Variables

Create a \`.env.local\` file in the root directory:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=https://rlotxrtdbqtnbglbmyea.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xft8dx8s2qhtL4Upw0oHVQ__trf1mEy
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_xft8dx8s2qhtL4Upw0oHVQ__trf1mEy
\`\`\`

### 3. Initialize Supabase PostgreSQL Database

1. Open your [Supabase Dashboard](https://supabase.com/dashboard/project/rlotxrtdbqtnbglbmyea).
2. Navigate to **SQL Editor**.
3. Copy and execute the migration script located at \`supabase/migrations/20261114_init_literatrack.sql\` (or view it inside the LiteraTrack Administrator Portal under **Database Setup**).
4. Run the query to create all tables, indexes, RLS policies, and standard NIOS subject seeds.

### 4. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to view the portal.

### 5. Build for Production

\`\`\`bash
npm run build
\`\`\`

---

## 👥 Instant Evaluation Roles (Demo Switcher)

On the login page or in the top banner of the application, you can switch between roles with a single click:

- **Administrator**: \`admin@literatrack.demo\`
- **Teacher**: \`rajesh.sharma@literatrack.demo\` (Dr. Rajesh Sharma, Mathematics)
- **Teacher**: \`sunita.verma@literatrack.demo\` (Mrs. Sunita Verma, Science & Physics)
- **Student**: \`aarav.patel@student.literatrack.demo\` (Aarav Patel, Class 10 NIOS)
- **Student**: \`kavya.menon@student.literatrack.demo\` (Kavya Menon, Class 12 NIOS)

---

## 🗄️ Database Tables Created

- \`profiles\` (User authentication accounts & role assignment)
- \`subjects\` (NIOS Secondary and Sr. Secondary courses)
- \`teachers\` (Faculty profiles and assigned grade streams)
- \`students\` (Learners, guardian contacts, prior education)
- \`teacher_subjects\` (Faculty competency allocations)
- \`student_subjects\` (Course enrollment mappings)
- \`class_sessions\` (Curriculum lectures, timings, duration, status)
- \`attendance\` (Per-student session attendance with late delay in minutes)
- \`attendance_audit_logs\` (Audit trail of corrections and reasons)
- \`demo_settings\` (Admin demo mode configuration)
- \`system_activity_logs\` (Platform audit logs)

---

## 🚢 Deployment to Vercel

1. Push your repository to GitHub.
2. Import the project into [Vercel](https://vercel.com).
3. Set the following Environment Variables in Vercel Project Settings:
   - \`NEXT_PUBLIC_SUPABASE_URL\`
   - \`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY\`
   - \`NEXT_PUBLIC_SUPABASE_ANON_KEY\`
4. Deploy!
