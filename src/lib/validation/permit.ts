import { z } from "zod";

export const PERMIT_TYPE_OPTIONS = [
  { value: "HOT_WORK", label: "Hot Work (Welding, Grinding)" },
  { value: "COLD_WORK", label: "Cold Work (Maintenance)" },
  { value: "CONFINED_SPACE", label: "Confined Space Entry" },
  { value: "EXCAVATION", label: "Excavation & Trenching" },
  { value: "WORKING_AT_HEIGHT", label: "Working at Height" },
  { value: "ELECTRICAL", label: "Electrical Work" },
] as const;

const permitTypeValues = PERMIT_TYPE_OPTIONS.map((o) => o.value) as [
  string,
  ...string[],
];

// --- Step 1: Type & Location -------------------------------------------
export const step1Schema = z.object({
  type: z.enum(permitTypeValues, {
    message: "Select a permit type.",
  }),
  facilityName: z.string().trim().min(2, "Enter a facility name."),
  specificLocation: z.string().trim().min(2, "Enter a specific location."),
  gpsLat: z.number().nullable(),
  gpsLng: z.number().nullable(),
});
export type Step1Values = z.infer<typeof step1Schema>;

// --- Step 2: Details & Dates ----------------------------------------------
const step2Base = z.object({
  workDescription: z
    .string()
    .trim()
    .min(20, "Describe the work in at least 20 characters.")
    .max(500, "Keep the description under 500 characters."),
  startDate: z.string().min(1, "Start date & time is required."),
  endDate: z.string().min(1, "End date & time is required."),
  requiredEquipment: z.array(z.string()).default([]),
});

export const step2Schema = step2Base
  .refine((data) => new Date(data.endDate) > new Date(data.startDate), {
    message: "End date must be after the start date.",
    path: ["endDate"],
  })
  .refine(
    (data) => {
      const hours =
        (new Date(data.endDate).getTime() -
          new Date(data.startDate).getTime()) /
        (1000 * 60 * 60);
      return hours <= 12;
    },
    {
      message:
        "Duration cannot exceed the 12-hour maximum for this permit type.",
      path: ["endDate"],
    },
  );
export type Step2Values = z.infer<typeof step2Schema>;

// --- Step 3: Contractor & Files --------------------------------------------
export const step3Schema = z.object({
  contractorName: z.string().trim().optional(),
  contractorIdNumber: z.string().trim().optional(),
  supervisorId: z.string().trim().min(1, "Select a supervisor in charge."),
});
export type Step3Values = z.infer<typeof step3Schema>;

// --- Step 4: Risk Assessment & Review --------------------------------------
export const HAZARD_OPTIONS = [
  {
    key: "fire_explosion",
    category: "Fire & Explosion",
    description: "Flammable atmosphere potential",
    icon: "local_fire_department",
  },
  {
    key: "working_at_height",
    category: "Working at Height",
    description: "Elevated platform/scaffolding",
    icon: "height",
  },
  {
    key: "toxic_gas",
    category: "Toxic Gas / H2S",
    description: "Continuous monitoring required",
    icon: "masks",
  },
  {
    key: "pressure_systems",
    category: "Pressure Systems",
    description: "Locked/Tagged-out valves",
    icon: "speed",
  },
] as const;

export const PPE_OPTIONS = [
  { key: "helmet", label: "Safety Helmet", icon: "construction" },
  { key: "gloves", label: "Welding Gloves", icon: "pan_tool" },
  { key: "boots", label: "Steel-Toe Boots", icon: "footprint" },
  { key: "respirator", label: "Respirator", icon: "air" },
] as const;

export const step4Schema = z.object({
  selectedHazards: z
    .array(z.string())
    .min(1, "Select at least one identified hazard."),
  selectedPPE: z
    .array(z.string())
    .min(1, "Select at least one required PPE item."),
  declarationAccepted: z.literal(true, {
    message: "You must confirm the safety declaration before submitting.",
  }),
});
export type Step4Values = z.infer<typeof step4Schema>;

// --- Combined schema used by the final server action ----------------------
export const createPermitSchema = step1Schema
  .merge(step2Base)
  .merge(step3Schema)
  .merge(step4Schema);

export type CreatePermitValues = z.infer<typeof createPermitSchema>;
