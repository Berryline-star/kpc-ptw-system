import { PrismaClient, Role, PermissionModule } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Default capability matrix for the admin "Permissions Matrix" screen.
// [canView, canCreate, canApprove, canDelete]
const DEFAULT_PERMISSIONS: Record<
  Role,
  Record<PermissionModule, [boolean, boolean, boolean, boolean]>
> = {
  SYSTEM_ADMIN: {
    WORK_PERMITS: [true, true, true, true],
    SAFETY_ANALYTICS: [true, true, true, true],
    ACCESS_CONTROL: [true, true, true, true],
    ASSET_REGISTRY: [true, true, true, true],
  },
  SAFETY_OFFICER: {
    WORK_PERMITS: [true, true, true, false],
    SAFETY_ANALYTICS: [true, true, false, false],
    ACCESS_CONTROL: [true, false, false, false],
    ASSET_REGISTRY: [true, false, false, false],
  },
  DEPOT_MANAGER: {
    WORK_PERMITS: [true, true, true, false],
    SAFETY_ANALYTICS: [true, false, false, false],
    ACCESS_CONTROL: [true, false, false, false],
    ASSET_REGISTRY: [true, true, false, false],
  },
  SUPERVISOR: {
    WORK_PERMITS: [true, true, false, false],
    SAFETY_ANALYTICS: [true, false, false, false],
    ACCESS_CONTROL: [false, false, false, false],
    ASSET_REGISTRY: [true, false, false, false],
  },
  CONTRACTOR: {
    WORK_PERMITS: [true, true, false, false],
    SAFETY_ANALYTICS: [false, false, false, false],
    ACCESS_CONTROL: [false, false, false, false],
    ASSET_REGISTRY: [false, false, false, false],
  },
};

async function main() {
  console.log("Seeding...");

  // Refuses to run with the well-known default password in production —
  // a seed script hardcoding "Password123!" across 6 accounts is fine
  // for local dev, but leaving it reachable in a real deployment is
  // exactly how systems get broken into. Set SEED_PASSWORD to something
  // real (and different per environment) to override; local dev without
  // it set still works exactly as before, just with a loud reminder.
  const seedPassword = process.env.SEED_PASSWORD;
  if (!seedPassword && process.env.NODE_ENV === "production") {
    throw new Error(
      "Refusing to seed with the default dev password in production. " +
        "Set the SEED_PASSWORD environment variable to a real, unique " +
        "password before running this in a production environment.",
    );
  }
  if (!seedPassword) {
    console.warn(
      "⚠️  Using the default dev password (Password123!) for all seeded " +
        "accounts — fine for local dev, but rotate every one of these " +
        "before this database is anything but local/staging.",
    );
  }

  const passwordHash = await bcrypt.hash(seedPassword ?? "Password123!", 10);

  const [admin, safetyOfficer, depotManager, contractor, supervisor, demo] =
    await Promise.all([
      prisma.user.upsert({
        where: { email: "admin@kpc.co.ke" },
        update: {},
        create: {
          name: "Eng. James Mwangi",
          email: "admin@kpc.co.ke",
          passwordHash,
          role: Role.SYSTEM_ADMIN,
          department: "ICT Infrastructure",
        },
      }),
      prisma.user.upsert({
        where: { email: "safety.officer@kpc.co.ke" },
        update: {},
        create: {
          name: "Kevin Omondi",
          email: "safety.officer@kpc.co.ke",
          passwordHash,
          role: Role.SAFETY_OFFICER,
          department: "HSE",
        },
      }),
      prisma.user.upsert({
        where: { email: "depot.manager@kpc.co.ke" },
        update: {},
        create: {
          name: "Sarah Mwangi",
          email: "depot.manager@kpc.co.ke",
          passwordHash,
          role: Role.DEPOT_MANAGER,
          department: "Operations",
        },
      }),
      prisma.user.upsert({
        where: { email: "contractor@kpc.co.ke" },
        update: {},
        create: {
          name: "John Njenga",
          email: "contractor@kpc.co.ke",
          passwordHash,
          role: Role.CONTRACTOR,
          department: "Pipeline Solutions Ltd",
        },
      }),
      prisma.user.upsert({
        where: { email: "supervisor@kpc.co.ke" },
        update: {},
        create: {
          name: "Eng. J. Kamau",
          email: "supervisor@kpc.co.ke",
          passwordHash,
          role: Role.SUPERVISOR,
          department: "Pump Station 27",
        },
      }),
      // Dedicated account for the public "Launch Demo" button — kept
      // separate from the real Contractor persona (John Njenga) so demo
      // visitors don't land in an account that reads like it belongs to
      // a specific real person, and so demo activity is identifiable
      // and easy to clean out later (e.g. `DELETE FROM "Permit" WHERE
      // "createdById" = '<this user's id>'`) without touching real
      // seeded data.
      prisma.user.upsert({
        where: { email: "demo@kpc.co.ke" },
        update: {},
        create: {
          name: "Demo Account",
          email: "demo@kpc.co.ke",
          passwordHash,
          role: Role.CONTRACTOR,
          department: "Public Demo Sandbox",
        },
      }),
    ]);

  console.log("Users seeded:", {
    admin: admin.email,
    safetyOfficer: safetyOfficer.email,
    depotManager: depotManager.email,
    contractor: contractor.email,
    supervisor: supervisor.email,
    demo: demo.email,
  });

  // --- Role/permission matrix --------------------------------------
  for (const role of Object.keys(DEFAULT_PERMISSIONS) as Role[]) {
    for (const permissionModule of Object.keys(
      DEFAULT_PERMISSIONS[role],
    ) as PermissionModule[]) {
      const [canView, canCreate, canApprove, canDelete] =
        DEFAULT_PERMISSIONS[role][permissionModule];
      await prisma.rolePermission.upsert({
        where: { role_module: { role, module: permissionModule } },
        update: { canView, canCreate, canApprove, canDelete },
        create: {
          role,
          module: permissionModule,
          canView,
          canCreate,
          canApprove,
          canDelete,
        },
      });
    }
  }
  console.log("Role permissions seeded.");

  // --- Permit #1: pending approval (Hot Work) -----------------------
  const permit1 = await prisma.permit.upsert({
    where: { permitNumber: "PTW-2026-0089" },
    update: {},
    create: {
      permitNumber: "PTW-2026-0089",
      type: "HOT_WORK",
      status: "PENDING_APPROVAL",
      facilityName: "Mombasa Terminal",
      specificLocation: "Tank 4",
      gpsLat: -4.0435,
      gpsLng: 39.6682,
      workDescription:
        "Welding repair on flange connection at Tank 4 outlet valve.",
      startDate: new Date("2026-06-12T08:00:00Z"),
      endDate: new Date("2026-06-12T17:00:00Z"),
      requiredEquipment: ["Welding Rig", "Gas Detector"],
      contractorName: "Pipeline Solutions Ltd",
      contractorIdNumber: "KPC-CONT-4471",
      department: "Operations & Maintenance",
      riskLevel: "MEDIUM",
      createdById: supervisor.id,
      supervisorId: supervisor.id,
      submittedAt: new Date("2026-06-12T07:45:00Z"),
      riskAssessment: {
        create: {
          overallScore: 9,
          overallLevel: "MEDIUM",
          status: "PENDING_REVIEW",
          requiredPPE: ["Welding Gloves", "Safety Helmet", "Respirator"],
          hazards: {
            create: [
              {
                description: "Flammable atmosphere potential",
                category: "Fire & Explosion",
                likelihood: 2,
                severity: 4,
                riskScore: 8,
                riskLevel: "MEDIUM",
              },
              {
                description: "Atmospheric poisoning hazard during flange removal",
                category: "Toxic Gas / H2S",
                likelihood: 3,
                severity: 3,
                riskScore: 9,
                riskLevel: "MEDIUM",
              },
            ],
          },
          controlMeasures: {
            create: [
              { description: "Continuous gas monitoring", status: "IMPLEMENTED" },
              {
                description: "Fire extinguisher on standby",
                status: "PENDING_DEPLOYMENT",
              },
            ],
          },
        },
      },
      approvalSteps: {
        create: [
          {
            sequence: 1,
            requiredRole: "SAFETY_OFFICER",
            approverId: safetyOfficer.id,
            status: "APPROVED",
            signedAt: new Date("2026-06-12T08:45:00Z"),
          },
          {
            sequence: 2,
            requiredRole: "DEPOT_MANAGER",
            status: "PENDING",
          },
        ],
      },
      activityEntries: {
        create: [
          {
            authorId: safetyOfficer.id,
            type: "COMMENT",
            message: "Gas tests cleared. Oxygen levels at 20.9%.",
          },
          {
            authorId: supervisor.id,
            type: "COMMENT",
            message: "Welding screens positioned. Standby firefighter in place.",
          },
        ],
      },
    },
  });

  // --- Permit #2: approved (Cold Work) -------------------------------
  await prisma.permit.upsert({
    where: { permitNumber: "PTW-2026-1142" },
    update: {},
    create: {
      permitNumber: "PTW-2026-1142",
      type: "COLD_WORK",
      status: "APPROVED",
      facilityName: "Nairobi Terminal",
      specificLocation: "Pump House B",
      workDescription: "External coating maintenance on pipework.",
      startDate: new Date("2026-06-14T08:00:00Z"),
      endDate: new Date("2026-06-14T16:00:00Z"),
      requiredEquipment: ["Spray Equipment"],
      department: "Maintenance",
      riskLevel: "LOW",
      createdById: supervisor.id,
      supervisorId: depotManager.id,
      submittedAt: new Date("2026-06-13T09:00:00Z"),
    },
  });

  // --- Permit #3: expired (Excavation) --------------------------------
  await prisma.permit.upsert({
    where: { permitNumber: "PTW-2026-0721" },
    update: {},
    create: {
      permitNumber: "PTW-2026-0721",
      type: "EXCAVATION",
      status: "EXPIRED",
      facilityName: "PS27",
      specificLocation: "Sector 1 Pipeline",
      workDescription: "Emergency leak repair excavation.",
      startDate: new Date("2026-05-20T08:00:00Z"),
      endDate: new Date("2026-05-20T18:00:00Z"),
      requiredEquipment: ["Excavator", "Shoring Equipment"],
      department: "Operations",
      riskLevel: "HIGH",
      createdById: supervisor.id,
      submittedAt: new Date("2026-05-20T07:00:00Z"),
    },
  });

  // --- Permit #4: closed (Confined Space) -----------------------------
  await prisma.permit.upsert({
    where: { permitNumber: "PTW-2026-0904" },
    update: {},
    create: {
      permitNumber: "PTW-2026-0904",
      type: "CONFINED_SPACE",
      status: "CLOSED",
      facilityName: "Mombasa Terminal",
      specificLocation: "Tank T-402",
      workDescription: "Periodic internal inspection of storage tank.",
      startDate: new Date("2026-04-26T08:00:00Z"),
      endDate: new Date("2026-04-26T17:00:00Z"),
      requiredEquipment: ["SCBA", "Tripod & Winch"],
      department: "Inspection",
      riskLevel: "HIGH",
      createdById: supervisor.id,
      supervisorId: safetyOfficer.id,
      submittedAt: new Date("2026-04-25T10:00:00Z"),
      closedAt: new Date("2026-04-26T18:00:00Z"),
    },
  });

  console.log("Permits seeded:", permit1.permitNumber, "+ 3 more.");
  console.log("Seed complete. All seeded users share the password: Password123!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
