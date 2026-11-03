import type { CloudUser, Entitlements } from "@/types";

const UNLIMITED = Number.MAX_SAFE_INTEGER;

const LOCAL_ENTITLEMENTS: Entitlements = {
  active: true,
  browserAutomation: true,
  crossOsFingerprints: true,
  cloudBackup: true,
  teamCollaboration: true,
  cookieBot: true,
  remoteInteractive: true,
  remoteControl: true,
  scheduledAutomation: true,
  agent: true,
  profileLimit: UNLIMITED,
  requestsPerHour: UNLIMITED,
  // Local use has no hour cap; the hosted quota route remains authoritative.
  remoteBrowserHours: UNLIMITED,
};

/** Local features do not depend on a cloud account or its plan response. */
export function getEntitlements(
  _user: CloudUser | null | undefined,
): Entitlements {
  return { ...LOCAL_ENTITLEMENTS };
}

/** The account's effective cloud plan, used by billing and display surfaces. */
export function effectivePlanOf(user: CloudUser | null | undefined): string {
  return user?.effectivePlan ?? user?.plan ?? "free";
}

/** Recipes on a schedule: available locally regardless of cloud plan. */
export function canUseScheduledAutomation(
  user: CloudUser | null | undefined,
): boolean {
  return getEntitlements(user).scheduledAutomation;
}

/** Local agent features are not tied to the account rollout flag. */
export function hasAgentAccess(user: CloudUser | null | undefined): boolean {
  return getEntitlements(user).agent;
}

export function canUseCookieBot(user: CloudUser | null | undefined): boolean {
  return getEntitlements(user).cookieBot;
}

/** The UI capability is local; cloud service calls still require their own auth. */
export function canUseRemoteControl(
  user: CloudUser | null | undefined,
): boolean {
  return getEntitlements(user).remoteControl;
}

/** Only a team owner sees per-member attribution. */
export function isTeamOwner(user: CloudUser | null | undefined): boolean {
  return Boolean(user?.teamId && user.teamRole === "owner");
}

/** A launcher seat may open team profiles but cannot edit team data. */
export function isTeamLauncher(user: CloudUser | null | undefined): boolean {
  return Boolean(user?.teamId) && user?.teamRole === "launcher";
}

/** Owners and admins read the team's activity log. The cloud checks again. */
export function canViewTeamActivity(
  user: CloudUser | null | undefined,
): boolean {
  return (
    Boolean(user?.teamId) &&
    (user?.teamRole === "owner" || user?.teamRole === "admin")
  );
}
