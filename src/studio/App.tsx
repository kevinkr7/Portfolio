import { useMemo, useState } from "react";
import portfolio from "../content/projects.json";

type Project = {
  slug: string;
  name: string;
  image: string;
  editorial: {
    overline: string;
    title: string;
    year: number;
    tagline: string;
    description: string;
    roleTitles: string[];
    stack: string[];
    liveUrl: string;
  };
  gallery: Array<{ url: string; alt: string; aspect: number }>;
};

const projects = portfolio.cards as Project[];

export function App() {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return projects;
    return projects.filter((project) =>
      [project.name, project.slug, project.editorial.tagline, ...project.editorial.stack]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    );
  }, [query]);

  return (
    <main>
      <header className="hero">
        <p className="eyebrow">Recovered production · React source layer</p>
        <h1>kevinography.in content studio</h1>
        <p className="lede">
          The deployed WebGL runtime is locked for zero visual deviation. Project content is sourced from
          <code>src/content/projects.json</code> and emitted by <code>npm run build</code>.
        </p>
        <div className="actions">
          <a className="primary" href="/" target="_blank" rel="noreferrer">Open recovered site</a>
          <a href="/lite" target="_blank" rel="noreferrer">Open lite experience</a>
        </div>
      </header>

      <section className="toolbar" aria-label="Project tools">
        <div>
          <strong>{projects.length}</strong>
          <span>projects in the source manifest</span>
        </div>
        <label>
          <span>Filter projects</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Name, slug, stack…"
          />
        </label>
      </section>

      <section className="grid" aria-label="Portfolio projects">
        {filtered.map((project) => (
          <article className="card" key={project.slug}>
            <img src={project.image} alt="" />
            <div className="cardBody">
              <div className="meta">
                <span>{project.editorial.overline}</span>
                <span>{project.editorial.year}</span>
              </div>
              <h2>{project.editorial.title}</h2>
              <p className="tagline">{project.editorial.tagline}</p>
              <p>{project.editorial.description}</p>
              <ul aria-label="Technology stack">
                {project.editorial.stack.map((item) => <li key={item}>{item}</li>)}
              </ul>
              <div className="cardLinks">
                <a href={`/projects/${project.slug}`} target="_blank" rel="noreferrer">Case study</a>
                <a href={project.editorial.liveUrl} target="_blank" rel="noreferrer">Live project</a>
              </div>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
