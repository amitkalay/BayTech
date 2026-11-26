"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownUp,
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  Clock3,
  Code2,
  Compass,
  MapPin,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import MapLoader from "@/components/map-loader";
import type { Job, JobsResponse } from "@/lib/jobs";

type RoleFilter = "all" | "Software engineering" | "Forward deployed";
const cityOptions = ["All Bay Area", "San Francisco", "South San Francisco", "San Bruno", "Millbrae", "Burlingame", "San Mateo", "Belmont", "San Carlos", "Redwood City", "Menlo Park", "Palo Alto", "Mountain View"];

function timeAgo(value?: string) {
  if (!value) return "Recently listed";
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return "Recently listed";
  const days = Math.floor((Date.now() - date.valueOf()) / 86_400_000);
  if (days <= 0) return "Listed today";
  if (days === 1) return "Listed yesterday";
  if (days < 8) return `${days} days ago`;
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date);
}

function initials(company: string) {
  return company.split(/\s+/).map((word) => word[0]).join("").slice(0, 2).toUpperCase();
}

function JobCard({ job, active, onSelect }: { job: Job; active: boolean; onSelect: () => void }) {
  return (
    <article
      className={`job-card ${active ? "job-card-active" : ""}`}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.target === event.currentTarget && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          onSelect();
        }
      }}
      tabIndex={0}
    >
      <div className="company-mark" aria-hidden="true">{initials(job.company)}</div>
      <div className="job-card-body">
        <div className="company-line">
          <span>{job.company}</span>
          <span className="posted-time"><Clock3 size={12} strokeWidth={1.8} />{timeAgo(job.postedAt)}</span>
        </div>
        <h3>{job.title}</h3>
        <div className="job-meta">
          <span><MapPin size={13} />{job.city}</span>
          <span className="meta-divider" />
          <span>{job.workMode}</span>
          {job.department && <><span className="meta-divider" /><span className="department-label">{job.department}</span></>}
        </div>
        <div className="job-card-footer">
          <span className={`role-pill ${job.category === "Forward deployed" ? "role-pill-fde" : ""}`}>
            {job.category === "Forward deployed" ? <Compass size={12} /> : <Code2 size={12} />}{job.category}
          </span>
          <a href={job.applyUrl} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()} className="apply-link">
            View role <ArrowUpRight size={14} />
          </a>
        </div>
      </div>
    </article>
  );
}

function JobSkeleton() {
  return <div className="job-skeleton"><span /><div><i /><i /><i /></div></div>;
}

export default function Home() {
  const [data, setData] = useState<JobsResponse | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<RoleFilter>("all");
  const [city, setCity] = useState<string | null>(null);
  const [activeCity, setActiveCity] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [sortRecent, setSortRecent] = useState(true);
  const [mobileView, setMobileView] = useState<"list" | "map">("list");
  const [cityMenuOpen, setCityMenuOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    fetch("/api/jobs", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Jobs endpoint unavailable");
        return response.json() as Promise<JobsResponse>;
      })
      .then((result) => { if (mounted) setData(result); })
      .catch(() => { if (mounted) setLoadError(true); });
    return () => { mounted = false; };
  }, []);

  const filteredJobs = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = (data?.jobs ?? []).filter((job) => {
      const matchesRole = role === "all" || job.category === role;
      const matchesCity = !city || job.city === city;
      const matchesQuery = !query || `${job.title} ${job.company} ${job.city} ${job.department ?? ""}`.toLowerCase().includes(query);
      return matchesRole && matchesCity && matchesQuery;
    });
    return filtered.sort((a, b) => sortRecent
      ? Date.parse(b.postedAt ?? "") - Date.parse(a.postedAt ?? "")
      : a.company.localeCompare(b.company));
  }, [data, search, role, city, sortRecent]);

  const softwareCount = data?.jobs.filter((job) => job.category === "Software engineering").length ?? 0;
  const fdeCount = data?.jobs.filter((job) => job.category === "Forward deployed").length ?? 0;
  const selectedCityLabel = city ?? "All Bay Area";

  function chooseCity(value: string) {
    const nextCity = value === "All Bay Area" ? null : value;
    setCity(nextCity);
    setActiveCity(nextCity);
    setCityMenuOpen(false);
  }

  return (
    <main className="app-shell">
      <header className="site-header">
        <a href="#top" className="brand" aria-label="Baytech home">
          <span className="brand-icon"><span /><span /><span /><span /></span>
          <span className="brand-word">baytech<span className="brand-dot">.</span></span>
          <span className="brand-divider" />
          <span className="brand-descriptor">THE BAY AREA JOB MAP</span>
        </a>
        <div className="header-right">
          <span className="live-indicator"><i /> Live company listings</span>
          <a className="header-link" href="https://github.com/amitkalay/BayTech" target="_blank" rel="noreferrer">About <ArrowUpRight size={14} /></a>
        </div>
      </header>

      <section className="intro" id="top">
        <div className="eyebrow"><Sparkles size={13} /> A clearer way to job hunt</div>
        <div className="intro-row">
          <div>
            <h1>Make your next move<br /><span>closer to home.</span></h1>
            <p className="intro-copy">Find software engineering and forward deployed roles across San Francisco and the Peninsula.</p>
          </div>
          <div className="intro-note"><span className="note-line" /><span>Local roles, mapped<br />from the source.</span></div>
        </div>
        <div className="search-bar">
          <Search size={18} strokeWidth={1.8} />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search roles, skills, or companies" aria-label="Search roles, skills, or companies" />
          {search && <button className="clear-search" type="button" onClick={() => setSearch("")} aria-label="Clear search"><X size={15} /></button>}
          <div className="search-separator" />
          <div className="city-select-wrap">
            <button className="city-select" type="button" onClick={() => setCityMenuOpen((open) => !open)} aria-expanded={cityMenuOpen}>
              <MapPin size={16} /> <span>{selectedCityLabel}</span> <ChevronDown size={15} />
            </button>
            {cityMenuOpen && <div className="city-menu">{cityOptions.map((option) => <button key={option} type="button" aria-pressed={selectedCityLabel === option} onClick={() => chooseCity(option)}>{option}{selectedCityLabel === option && <Check size={14} />}</button>)}</div>}
          </div>
          <button className="search-action" type="button" onClick={() => setMobileView("list")} aria-label="Search jobs"><ArrowRight size={17} /></button>
        </div>
        <div className="intro-underbar"><span><Check size={13} /> Fully remote roles filtered out</span><span><Clock3 size={13} /> Feeds refresh every 6 hours</span><span><BriefcaseBusiness size={13} /> Apply on company career sites</span></div>
      </section>

      <section className="discovery" aria-label="Job listings and map">
        <div className="results-panel">
          <div className="results-topline">
            <div><span className="section-kicker">THE OPEN ROLE INDEX</span><h2>Find your fit<span className="title-period">.</span></h2></div>
            <div className="mobile-view-toggle" aria-label="Choose list or map view"><button className={mobileView === "list" ? "active" : ""} onClick={() => setMobileView("list")} type="button">List</button><button className={mobileView === "map" ? "active" : ""} onClick={() => setMobileView("map")} type="button">Map</button></div>
          </div>
          <div className="role-tabs" role="tablist" aria-label="Filter by role type">
            <button className={role === "all" ? "role-tab selected" : "role-tab"} onClick={() => setRole("all")} type="button" role="tab" aria-selected={role === "all"}>All roles <span>{data ? data.jobs.length : "—"}</span></button>
            <button className={role === "Software engineering" ? "role-tab selected" : "role-tab"} onClick={() => setRole("Software engineering")} type="button" role="tab" aria-selected={role === "Software engineering"}>Software engineering <span>{data ? softwareCount : "—"}</span></button>
            <button className={role === "Forward deployed" ? "role-tab selected" : "role-tab"} onClick={() => setRole("Forward deployed")} type="button" role="tab" aria-selected={role === "Forward deployed"}>Forward deployed <span>{data ? fdeCount : "—"}</span></button>
          </div>
          <div className="listing-toolbar">
            <div className="results-count">{data ? <><strong>{filteredJobs.length}</strong> roles <span>in {city ?? "San Francisco + Peninsula"}</span></> : "Loading live listings"}</div>
            <button className="sort-button" type="button" onClick={() => setSortRecent((value) => !value)}><ArrowDownUp size={14} /> {sortRecent ? "Most recent" : "Company A–Z"}</button>
          </div>
          {(loadError || data?.sources.healthy === 0) && <div className="feed-alert"><span className="alert-mark">!</span><div><strong>Listings couldn’t load just now.</strong><span>Company boards may be temporarily unavailable. Refresh to try again.</span></div><button type="button" onClick={() => window.location.reload()}>Retry</button></div>}
          <div className="job-list">
            {!data && !loadError && <><JobSkeleton /><JobSkeleton /><JobSkeleton /></>}
            {data && filteredJobs.length === 0 && <div className="empty-state"><div className="empty-icon"><SlidersHorizontal size={19} /></div><h3>No roles match those filters</h3><p>Try a broader search or clear the city filter to see more local openings.</p><button type="button" onClick={() => { setSearch(""); chooseCity("All Bay Area"); setRole("all"); }}>Clear all filters</button></div>}
            {filteredJobs.map((job) => <JobCard key={job.id} job={job} active={selectedJob === job.id} onSelect={() => { setSelectedJob(job.id); setActiveCity(job.city); }} />)}
          </div>
          {data && <div className="list-footer"><span><i className="footer-live-dot" /> Live from {data.sources.healthy} of {data.sources.total} company boards</span><a href="#top">Back to top <ArrowRight size={13} /></a></div>}
        </div>

        <aside className={`map-panel ${mobileView === "map" ? "mobile-map-visible" : ""}`} aria-label="Map of jobs">
          <div className="map-head"><div><span className="section-kicker">EXPLORE BY PLACE</span><h2>Work around here<span className="title-period">.</span></h2></div><span className="map-frame-label"><span /> SF + PENINSULA</span></div>
          <div className="map-frame">
            {data ? <MapLoader jobs={filteredJobs} activeCity={activeCity} selectedJob={selectedJob} onCitySelect={(nextCity) => { setCity(nextCity); setActiveCity(nextCity); }} onJobSelect={(id) => setSelectedJob(id)} /> : <div className="map-loading"><span className="map-loading-dot" />{loadError ? "Map is ready when listings return" : "Preparing the Bay Area map"}</div>}
            <div className="map-caption"><span><MapPin size={13} /> {groupsLabel(filteredJobs)}</span><span>Pan · zoom · explore</span></div>
          </div>
          <div className="map-note"><div className="map-note-icon"><Compass size={16} /></div><p><strong>Your next chapter is closer than you think.</strong><span>Select a place marker to narrow the list to jobs nearby.</span></p></div>
          <div className="map-credit">Map data &copy; OpenStreetMap contributors</div>
        </aside>
      </section>

      <footer className="site-footer"><span>baytech<span className="brand-dot">.</span>jobs</span><span>Built for the builders of the Bay.</span><span className="footer-refresh"><span /> Updated from public career boards every 6 hours</span></footer>
    </main>
  );
}

function groupsLabel(jobs: Job[]) {
  const count = new Set(jobs.map((job) => job.city)).size;
  return `${count} ${count === 1 ? "place" : "places"} · ${jobs.length} ${jobs.length === 1 ? "role" : "roles"}`;
}
