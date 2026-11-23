import { MediaPlaceholder } from "./media-placeholder";
import { Paragraph } from "./paragraph";
import { Pill } from "./pill";
import { Section } from "./section";
import { SectionHeader } from "./section-header";

type Team = {
  name: string;
  // The team's posture, on the pill over its media, with the dot in the team's color.
  posture: string;
  dot: "red" | "blue";
  line: string;
};

const TEAMS: Team[] = [
  {
    name: "Red Team",
    posture: "Ofensiva · antes da produção",
    dot: "red",
    line: "Ataca os agentes antes que alguém de fora ataque.",
  },
  {
    name: "Blue Team",
    posture: "Defensiva · em produção",
    dot: "blue",
    line: "Protege cada conversa entre clientes e agentes.",
  },
];

// Times (2): the section head with "Ver o ciclo" and the two team cards, one under the other. Each card
// is a 16:10 media placeholder for a video (a design gap: it stays a placeholder) with the team's posture
// pill in its corner, then the team's name and one line. Each card rises into place as it enters the view.
export function Teams() {
  return (
    <Section block="teams" id="times" labelledBy="teams-title">
      <SectionHeader
        id="teams-title"
        title="Times"
        count={TEAMS.length}
        link={{ label: "Ver o ciclo", href: "#ciclo" }}
      />
      <div className="flex flex-col gap-14">
        {TEAMS.map((team) => (
          <article key={team.name} className="rise flex flex-col gap-5">
            <MediaPlaceholder mark="inserir vídeo · 16:10" className="aspect-16-10">
              <Pill dot={team.dot} onMedia>
                {team.posture}
              </Pill>
            </MediaPlaceholder>
            <div className="flex flex-col gap-1.5">
              <h3 className="font-normal text-28 text-bright leading-115 tracking-tight-30">
                {team.name}
              </h3>
              <Paragraph>{team.line}</Paragraph>
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}
