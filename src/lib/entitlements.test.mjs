import assert from "node:assert/strict";
import test from "node:test";
import {
  canUseCookieBot,
  canUseRemoteControl,
  canUseScheduledAutomation,
  canViewTeamActivity,
  effectivePlanOf,
  getEntitlements,
  hasAgentAccess,
  isTeamLauncher,
  isTeamOwner,
} from "./entitlements.ts";

const FULL = {
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
  profileLimit: Number.MAX_SAFE_INTEGER,
  requestsPerHour: Number.MAX_SAFE_INTEGER,
  remoteBrowserHours: Number.MAX_SAFE_INTEGER,
};

const USER = {
  id: "user-1",
  email: "user@example.test",
  plan: "free",
  planPeriod: null,
  subscriptionStatus: "active",
  profileLimit: 3,
  cloudProfilesUsed: 3,
  proxyBandwidthLimitMb: 0,
  proxyBandwidthUsedMb: 0,
};

const DENIED = {
  active: false,
  browserAutomation: false,
  crossOsFingerprints: false,
  cloudBackup: false,
  teamCollaboration: false,
  cookieBot: false,
  remoteInteractive: false,
  remoteControl: false,
  scheduledAutomation: false,
  agent: false,
  profileLimit: 0,
  requestsPerHour: 0,
  remoteBrowserHours: 0,
};

test("local capabilities do not depend on cloud account or plan state", () => {
  const users = [
    null,
    undefined,
    USER,
    { ...USER, plan: "pro", subscriptionStatus: "canceled" },
    { ...USER, plan: "pro", entitlements: DENIED },
  ];

  for (const user of users) {
    assert.deepEqual(getEntitlements(user), FULL);
    assert.equal(canUseCookieBot(user), true);
    assert.equal(canUseRemoteControl(user), true);
    assert.equal(canUseScheduledAutomation(user), true);
    assert.equal(hasAgentAccess(user), true);
  }
});

test("team capabilities still require a real team identity and role", () => {
  const owner = { ...USER, teamId: "team-1", teamRole: "owner" };
  const admin = { ...USER, teamId: "team-1", teamRole: "admin" };
  const launcher = { ...USER, teamId: "team-1", teamRole: "launcher" };
  const member = { ...USER, teamId: "team-1", teamRole: "member" };

  assert.equal(isTeamOwner(owner), true);
  assert.equal(isTeamOwner(admin), false);
  assert.equal(isTeamLauncher(launcher), true);
  assert.equal(isTeamLauncher(owner), false);
  assert.equal(canViewTeamActivity(owner), true);
  assert.equal(canViewTeamActivity(admin), true);
  assert.equal(canViewTeamActivity(member), false);
  assert.equal(isTeamOwner(null), false);
  assert.equal(isTeamLauncher(null), false);
  assert.equal(canViewTeamActivity(null), false);
});

test("the displayed cloud plan remains account data", () => {
  assert.equal(effectivePlanOf(USER), "free");
  assert.equal(effectivePlanOf(null), "free");
  assert.equal(
    getEntitlements(USER).remoteBrowserHours,
    Number.MAX_SAFE_INTEGER,
  );
});
