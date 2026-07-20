import { InlineComingSoon } from "@/components/layout/inline-coming-soon";

// This screen (global security policy: MFA requirement, session timeout,
// password expiry, geofencing) has no backing Prisma model yet — unlike
// Users/Roles/Activity Logs, which all map onto tables that already
// existed. Building a form here that "saves" to nowhere would look done
// without being done, so this stays an honest placeholder until a
// SecuritySettings model + migration lands.
export default function AccessControlPage() {
  return (
    <InlineComingSoon
      title="Access Control Settings"
      phase="Needs a schema model — flagged, not started"
      icon="shield_person"
    />
  );
}
