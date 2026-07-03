import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const REGIONS = { "81": "JP", "84": "GLB" };

const normTid = (tid) => String(tid).slice(0, -2);
const badge = (tid) => {
  const value = String(tid).slice(-2);
  return value === "11" ? "MAX" : value;
};
const img = (resourceId) =>
  `https://enikk.app/_next/image?url=%2Fcharacters%2Fsi_c${String(resourceId).padStart(3, "0")}_00_s.png&w=3840&q=75`;

function characterMap() {
  const raw = JSON.parse(fs.readFileSync(path.join(ROOT, "all_characters.json"), "utf8"));
  const map = new Map();

  for (const c of raw.characters) {
    const id = normTid(c.tableId);
    if (!map.has(id)) {
      map.set(id, {
        id,
        name: c.name,
        resourceId: c.resourceId,
        image: img(c.resourceId),
        element: c.element?.name ?? "Water",
      });
    }
  }

  return map;
}

export function getRaidData() {
  const chars = characterMap();
  const groups = new Map();
  const units = new Map();
  const players = [];
  let totalParses = 0;

  for (const [folder, region] of Object.entries(REGIONS)) {
    const dir = path.join(ROOT, "raid", folder);

    for (const file of fs.readdirSync(dir)) {
      if (!file.endsWith(".json")) continue;

      const record = JSON.parse(fs.readFileSync(path.join(dir, file), "utf8"));
      const playerTeams = [];

      for (const team of record.teams ?? []) {
        const members = (team.units ?? []).map((unit) => {
          const id = normTid(unit.tid);
          const meta = chars.get(id) ?? { id, name: `Unknown ${id}`, resourceId: id, image: img(id) };
          return { ...meta, badge: badge(unit.tid), combat: unit.combat };
        });
        if (!members.length) continue;

        totalParses++;
        for (const unit of new Map(members.map((unit) => [unit.id, unit])).values()) {
          const hit = units.get(unit.id) ?? { ...unit, parses: 0 };
          hit.parses++;
          units.set(unit.id, hit);
        }

        const key = members.map((unit) => unit.id).sort().join("-");
        const parse = {
          key,
          region,
          usn: record.usn,
          nickname: record.nickname,
          damage: team.damage ?? 0,
          combat: members.reduce((sum, unit) => sum + (unit.combat ?? 0), 0),
          members,
        };
        const group =
          groups.get(key) ??
          {
            key,
            members: [...members].sort((a, b) => a.name.localeCompare(b.name)),
            parses: 0,
            regions: { JP: 0, GLB: 0 },
            best: parse,
            runs: [],
          };

        group.parses++;
        group.regions[region]++;
        group.runs.push(parse);
        if (parse.damage > group.best.damage) group.best = parse;
        groups.set(key, group);
        playerTeams.push(parse);
      }

      if (playerTeams.length > 1) {
        players.push({
          key: `${region}-${record.usn}`,
          region,
          usn: record.usn,
          nickname: record.nickname,
          damage: record.total_damage || playerTeams.reduce((sum, team) => sum + team.damage, 0),
          combat: playerTeams.reduce((sum, team) => sum + team.combat, 0),
          teams: playerTeams,
        });
      }
    }
  }

  const sortedPlayers = players
      .map((player) => ({
        ...player,
        teams: player.teams
          .map((team) => ({ ...team, parses: groups.get(team.key)?.parses ?? 1 }))
          .sort((a, b) => b.damage - a.damage),
      }))
      .sort((a, b) => b.damage - a.damage);

  const fakePlayer = {
    key: "fake-apple",
    region: "GLB",
    usn: "apple",
    nickname: "apple",
    damage: 10_000_000_000_000,
    displayDamage: "10000B",
    combat: 0,
    teams: [],
  };

  return {
    players: sortedPlayers,
    fakePlayer,
    teams: [...groups.values()]
      .filter((team) => team.parses > 1)
      .sort((a, b) => b.parses - a.parses || b.best.damage - a.best.damage),
    units: [...units.values()]
      .sort((a, b) => b.parses - a.parses || a.name.localeCompare(b.name))
      .slice(0, 50)
      .map((unit) => ({ ...unit, pct: (unit.parses / totalParses) * 100 })),
    totalParses,
  };
}
