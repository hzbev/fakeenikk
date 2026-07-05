"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

const fmt = new Intl.NumberFormat("en-US");
const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 2 });

function UnitIcon({ unit }) {
  return (
    <span className="unit" data-element={unit.element} title={`${unit.name} (${unit.id})`}>
      <img src={unit.image} alt={unit.name} onError={(e) => (e.currentTarget.style.display = "none")} />
      <b>{unit.badge}</b>
    </span>
  );
}

export default function RaidBoard({ data }) {
  const [tab, setTab] = useState("players");
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("ALL");
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(null);

  const players = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.players.filter((player) => {
      const inRegion = region === "ALL" || player.region === region;
      const text = [player.nickname, player.usn, ...player.teams.flatMap((team) => team.members.map((unit) => unit.name))]
        .join(" ")
        .toLowerCase();
      return inRegion && (!q || text.includes(q));
    });
  }, [data.players, query, region]);

  const units = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.units.filter((unit) => !q || unit.name.toLowerCase().includes(q) || unit.id.includes(q));
  }, [data.units, query]);
  const rows = tab === "players" ? players : units;
  const pageCount = Math.max(1, Math.ceil(rows.length / limit));
  const pageRows =
    tab === "players" && page === 1
      ? [...rows.slice(0, limit), data.fakePlayer]
      : rows.slice((page - 1) * limit, page * limit);
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1).filter((n) => n === 1 || n === pageCount || Math.abs(n - page) <= 2);

  useEffect(() => {
    setPage(1);
    setOpen(null);
  }, [query, region, limit, tab]);

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  useEffect(() => {
    setOpen(null);
  }, [page]);

  return (
    <main>
      <section className="toolbar">
        <label className="search">
          <span>⌕</span>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search" />
        </label>
        <select value={limit} onChange={(e) => setLimit(Number(e.target.value))} aria-label="Rows per page">
          <option value={10}>10 per page</option>
          <option value={25}>25 per page</option>
          <option value={50}>50 per page</option>
        </select>
        <select value={region} onChange={(e) => setRegion(e.target.value)} aria-label="Region">
          <option value="ALL">World</option>
          <option value="GLB">Global</option>
          <option value="JP">Japan</option>
        </select>
        <div className="tabs" role="tablist" aria-label="View">
          <button className={tab === "players" ? "active" : ""} onClick={() => setTab("players")}>
            Players
          </button>
          <button className={tab === "units" ? "active" : ""} onClick={() => setTab("units")}>
            Units
          </button>
        </div>
        <Link className="navLink" href="/teams">
          Teams
        </Link>
      </section>

      {tab === "players" ? (
        <section className="table">
          {pageRows.map((player, index) => {
            const expanded = open === player.key;
            const rank = (page - 1) * limit + index + 1;
            return (
              <article className={`rowWrap ${player.key === "fake-apple" ? "fakeRow" : ""}`} key={player.key}>
                <button className="teamRow playerRow" onClick={() => setOpen(expanded ? null : player.key)}>
                  <span className="rank">#{rank}</span>
                  <span className="best">
                    <strong>{player.nickname}</strong>
                    <em>
                      {player.region} {player.usn}
                    </em>
                  </span>
                  <span className="damage">{player.displayDamage ?? compact.format(player.damage)}</span>
                  <span className="cp">{compact.format(player.combat)} CP</span>
                  <span className="parse">{player.teams.length} teams</span>
                  <span className="plus">{expanded ? "×" : "+"}</span>
                </button>
                {expanded && (
                  <div className="runs">
                    {player.teams.map((team) => (
                      <div className="run teamRun" key={`${player.key}-${team.key}-${team.damage}`}>
                        <span className="icons">{team.members.map((unit) => <UnitIcon unit={unit} key={unit.id} />)}</span>
                        <strong>{fmt.format(team.damage)}</strong>
                        <em>{fmt.format(team.combat)} CP</em>
                        <span className="parse" title="Count of total parses of this team">
                          {team.parses}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </article>
            );
          })}
        </section>
      ) : (
        <section className="units">
          {pageRows.map((unit, index) => (
            <article className="unitRow" key={unit.id}>
              <span className="rank">#{(page - 1) * limit + index + 1}</span>
              <UnitIcon unit={unit} />
              <strong>{unit.name}</strong>
              <em>{unit.id}</em>
              <span>{unit.parses} parses</span>
              <b>{unit.pct.toFixed(1)}%</b>
            </article>
          ))}
        </section>
      )}
      <nav className="pager" aria-label="Pagination">
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>
          ‹
        </button>
        {pages.map((n, i) => (
          <button className={n === page ? "active" : ""} key={`${n}-${i}`} onClick={() => setPage(n)}>
            {i > 0 && n - pages[i - 1] > 1 ? `… ${n}` : n}
          </button>
        ))}
        <button disabled={page === pageCount} onClick={() => setPage(page + 1)}>
          ›
        </button>
      </nav>
    </main>
  );
}
