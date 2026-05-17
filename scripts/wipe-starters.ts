// One-time cleanup script.
// Run this once after upgrading to Phase 4 to wipe the starter tasks/rewards
// that were auto-provisioned during your initial signup.
//
// Run with: npm run db:wipe-starters <CALLSIGN>
//
// This deletes:
//   - All tasks for the profile
//   - All rewards for the profile
//   - All task completions (cascade)
//   - All redemptions (cascade)
//
// It does NOT touch: the profile itself, stats, quests, or auth.
// XP earned on the profile is also preserved.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const callsignArg = process.argv[2];
  if (!callsignArg) {
    console.error("Usage: npm run db:wipe-starters <CALLSIGN>");
    console.error("Example: npm run db:wipe-starters GHOST_07");
    process.exit(1);
  }

  const callsign = callsignArg.toUpperCase();

  // Fetch profile without trying to include relations — query counts separately
  const profile = await prisma.profile.findUnique({
    where: { callsign },
  });

  if (!profile) {
    console.error(`No profile found with callsign: ${callsign}`);
    process.exit(1);
  }

  const [taskCount, rewardCount, completionCount, redemptionCount] = await Promise.all([
    prisma.task.count({ where: { profileId: profile.id } }),
    prisma.reward.count({ where: { profileId: profile.id } }),
    prisma.taskCompletion.count({ where: { profileId: profile.id } }),
    prisma.redemption.count({ where: { profileId: profile.id } }),
  ]);

  console.log(`\nProfile: ${profile.callsign}`);
  console.log(`  Tasks: ${taskCount}`);
  console.log(`  Rewards: ${rewardCount}`);
  console.log(`  Completions (will cascade): ${completionCount}`);
  console.log(`  Redemptions (will cascade): ${redemptionCount}`);
  console.log(`\nProfile XP, stats, and quests are preserved.`);
  console.log("\nDeleting in 3 seconds... (Ctrl+C to abort)");
  await new Promise((r) => setTimeout(r, 3000));

  // Order matters: delete completions/redemptions first to avoid FK violations
  // (even though our schema has onDelete: Cascade, being explicit is safer)
  const result = await prisma.$transaction([
    prisma.taskCompletion.deleteMany({ where: { profileId: profile.id } }),
    prisma.redemption.deleteMany({ where: { profileId: profile.id } }),
    prisma.task.deleteMany({ where: { profileId: profile.id } }),
    prisma.reward.deleteMany({ where: { profileId: profile.id } }),
  ]);

  console.log(`\nDeleted:`);
  console.log(`  Completions: ${result[0].count}`);
  console.log(`  Redemptions: ${result[1].count}`);
  console.log(`  Tasks: ${result[2].count}`);
  console.log(`  Rewards: ${result[3].count}`);
  console.log("\nDone. Your slate is clean. Open the dashboard and create your first directive.");
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
