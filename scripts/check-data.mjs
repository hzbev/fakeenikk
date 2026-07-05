import assert from "node:assert/strict";
import { getRaidData } from "../lib/raidData.js";

const data = getRaidData();

assert(data.totalParses > 0);
assert(data.players.length > 0);
assert(data.players.every((player) => player.teams.length > 1));
assert.equal(data.fakePlayer.nickname, "apple");
assert(data.teams.length > 0);
assert(data.teams.every((team) => team.parses > 1));
assert(data.teams.every((team) => team.members.length > 0));
assert(data.teams.every((team, index) => index === 0 || data.teams[index - 1].parses >= team.parses));
assert(data.units.length === 50);
assert(data.units.every((unit) => unit.pct > 0 && unit.pct <= 100));
assert(data.players.every((player) => player.teams.every((team) => team.members.every((unit) => unit.badge && unit.element))));

const crownTeam = data.teams.find((team) => team.key.includes("4330"));
assert(crownTeam?.members.some((unit) => unit.name === "Crown"));

console.log(`ok: ${data.totalParses} parses, ${data.teams.length} repeated teams, ${data.units.length} units`);
