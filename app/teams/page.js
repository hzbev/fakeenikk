import Link from "next/link";
import { getRaidData } from "../../lib/raidData";

const fmt = new Intl.NumberFormat("en-US");
const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 2 });

function UnitIcon({ unit }) {
  return (
    <span className="unit" data-element={unit.element} title={`${unit.name} (${unit.id})`}>
      <img src={unit.image} alt={unit.name} />
      <b>{unit.badge}</b>
    </span>
  );
}

export default function TeamsPage() {
  const { teams } = getRaidData();

  return (
    <main>
      <section className="toolbar teamsToolbar">
        <Link className="navLink" href="/">
          Players
        </Link>
        <strong>Teams by parses</strong>
      </section>
      <section className="table">
        {teams.map((team, index) => (
          <article className="teamRow" key={team.key}>
            <span className="rank">#{index + 1}</span>
            <span className="icons">{team.members.map((unit) => <UnitIcon unit={unit} key={unit.id} />)}</span>
            <span className="best">
              <strong>{team.best.nickname}</strong>
              <em>
                {team.best.region} {team.best.usn}
              </em>
            </span>
            <span className="damage">{compact.format(team.best.damage)}</span>
            <span className="cp">{compact.format(team.best.combat)} CP</span>
            <span className="parse" title="Count of total parses of this team">
              {fmt.format(team.parses)}
            </span>
          </article>
        ))}
      </section>
    </main>
  );
}
