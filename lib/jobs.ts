export type ATS = "greenhouse" | "ashby" | "lever";

export type Company = {
  name: string;
  ats: ATS;
  board: string;
};

export type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  city: string;
  latitude: number;
  longitude: number;
  workMode: "Bay Area office";
  category: "Software engineering" | "Forward deployed";
  department?: string;
  postedAt?: string;
  applyUrl: string;
  description?: string;
};

export type JobsResponse = {
  jobs: Job[];
  refreshedAt: string;
  sources: { total: number; healthy: number };
};

// Public career board identifiers. Add companies here as coverage expands.
export const companies: Company[] = [
  { name: "Stripe", ats: "greenhouse", board: "stripe" },
  { name: "Anthropic", ats: "greenhouse", board: "anthropic" },
  { name: "Figma", ats: "greenhouse", board: "figma" },
  { name: "Robinhood", ats: "greenhouse", board: "robinhood" },
  { name: "Datadog", ats: "greenhouse", board: "datadog" },
  { name: "Cloudflare", ats: "greenhouse", board: "cloudflare" },
  { name: "Coinbase", ats: "greenhouse", board: "coinbase" },
  { name: "Asana", ats: "greenhouse", board: "asana" },
  { name: "Brex", ats: "greenhouse", board: "brex" },
  { name: "Scale AI", ats: "greenhouse", board: "scaleai" },
  { name: "Instacart", ats: "greenhouse", board: "instacart" },
  { name: "Pinterest", ats: "greenhouse", board: "pinterest" },
  { name: "Airbnb", ats: "greenhouse", board: "airbnb" },
  { name: "Reddit", ats: "greenhouse", board: "reddit" },
  { name: "Block", ats: "greenhouse", board: "block" },
  { name: "Waymo", ats: "greenhouse", board: "waymo" },
  { name: "Gusto", ats: "greenhouse", board: "gusto" },
  { name: "Discord", ats: "greenhouse", board: "discord" },
  { name: "Dropbox", ats: "greenhouse", board: "dropbox" },
  { name: "Affirm", ats: "greenhouse", board: "affirm" },
  { name: "Chime", ats: "greenhouse", board: "chime" },
  { name: "Twitch", ats: "greenhouse", board: "twitch" },
  { name: "Attentive", ats: "greenhouse", board: "attentive" },
  { name: "MongoDB", ats: "greenhouse", board: "mongodb" },
  { name: "Perplexity", ats: "ashby", board: "perplexity" },
  { name: "Cursor", ats: "ashby", board: "cursor" },
  { name: "Linear", ats: "ashby", board: "linear" },
  { name: "Runway", ats: "ashby", board: "runway" },
  { name: "Modal", ats: "ashby", board: "modal" },
  { name: "Poolside", ats: "ashby", board: "poolside" },
  { name: "ElevenLabs", ats: "ashby", board: "elevenlabs" },
];

const cities = [
  { name: "San Francisco", pattern: /san francisco|\bsf,? ca\b/i, latitude: 37.7749, longitude: -122.4194 },
  { name: "South San Francisco", pattern: /south san francisco/i, latitude: 37.6547, longitude: -122.4077 },
  { name: "San Bruno", pattern: /san bruno/i, latitude: 37.6305, longitude: -122.4111 },
  { name: "Millbrae", pattern: /millbrae/i, latitude: 37.5985, longitude: -122.3872 },
  { name: "Burlingame", pattern: /burlingame/i, latitude: 37.5841, longitude: -122.3661 },
  { name: "San Mateo", pattern: /san mateo/i, latitude: 37.563, longitude: -122.3255 },
  { name: "Belmont", pattern: /belmont/i, latitude: 37.5202, longitude: -122.2758 },
  { name: "San Carlos", pattern: /san carlos/i, latitude: 37.5072, longitude: -122.2605 },
  { name: "Redwood City", pattern: /redwood city/i, latitude: 37.4852, longitude: -122.2364 },
  { name: "Menlo Park", pattern: /menlo park/i, latitude: 37.453, longitude: -122.1817 },
  { name: "Palo Alto", pattern: /palo alto/i, latitude: 37.4419, longitude: -122.143 },
  { name: "Mountain View", pattern: /mountain view/i, latitude: 37.3861, longitude: -122.0839 },
];

function cleanText(value?: string) {
  return (value ?? "").replace(/<[^>]*>/g, " ").replace(/&nbsp;|&#160;/gi, " ").replace(/&amp;/gi, "&").replace(/\s+/g, " ").trim();
}

function roleCategory(title: string): Job["category"] | null {
  const value = title.toLowerCase();
  if (/forward[- ]deployed|\bfde\b/.test(value)) {
    if (/program|partnership|\bpartner\b|sales|account|\bmanager\b|\bdirector\b|\bhead\b/.test(value)) return null;
    return "Forward deployed";
  }
  if (/technical program manager|engineering program manager|\bprogram lead\b|project manager|software engineering manager|\bmanager, software engineering\b|director.*software engineering|head of.*engineering/.test(value)) return null;
  if (/software|\bswe\b|frontend|front.end|backend|back.end|full.stack|platform engineer|infrastructure engineer|product engineer|machine learning engineer|ml engineer|ai engineer|application engineer|site reliability|devops engineer|mobile engineer|ios engineer|android engineer|security engineer/.test(value)) return "Software engineering";
  return null;
}

function localCity(location: string) {
  return cities.find((city) => city.pattern.test(location));
}

function isExplicitlyRemote(workplaceType?: string, isRemote?: boolean, location?: string, title?: string) {
  if (isRemote === true || /remote/i.test(workplaceType ?? "")) return true;
  // Career boards usually omit work mode when a local office is the job location.
  // Exclude listings that explicitly call the role remote, even if they mention a local city.
  if (/remote|anywhere/i.test(`${location ?? ""} ${title ?? ""}`)) return true;
  return !localCity(location ?? "");
}

function makeJob(
  company: Company,
  input: {
    id?: string | number;
    title?: string;
    location?: string;
    workplaceType?: string;
    isRemote?: boolean;
    url?: string;
    department?: string;
    postedAt?: string;
    description?: string;
  },
): Job | null {
  const title = cleanText(input.title);
  const location = cleanText(input.location);
  const city = localCity(location);
  const category = roleCategory(title);
  if (!city || !category || isExplicitlyRemote(input.workplaceType, input.isRemote, location, title) || !input.url) return null;
  const description = cleanText(input.description).slice(0, 360);
  return {
    id: `${company.board}-${input.id ?? title}`,
    title,
    company: company.name,
    location,
    city: city.name,
    latitude: city.latitude,
    longitude: city.longitude,
    workMode: "Bay Area office",
    category,
    department: cleanText(input.department) || undefined,
    postedAt: input.postedAt,
    applyUrl: input.url,
    description: description || undefined,
  };
}

async function fetchJson(url: string) {
  const response = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": "BayTechJobMap/1.0 (+https://github.com/amitkalay/BayTech)" },
    next: { revalidate: 21_600 },
    signal: AbortSignal.timeout(12_000),
  });
  if (!response.ok) throw new Error(`Feed responded ${response.status}`);
  return response.json();
}

async function fetchCompany(company: Company): Promise<Job[]> {
    if (company.ats === "greenhouse") {
      const data = await fetchJson(`https://boards-api.greenhouse.io/v1/boards/${company.board}/jobs`);
      return (data.jobs ?? []).map((job: Record<string, unknown>) => {
        const location = (job.location as { name?: string } | undefined)?.name ?? "";
        const departments = (job.departments as { name?: string }[] | undefined)?.map((item) => item.name).join(", ");
        return makeJob(company, {
          id: job.id as string | number,
          title: job.title as string,
          location,
          url: job.absolute_url as string,
          department: departments,
          postedAt: (job.first_published ?? job.updated_at) as string | undefined,
          description: job.content as string,
        });
      }).filter((job: Job | null): job is Job => Boolean(job));
    }
    if (company.ats === "ashby") {
      const data = await fetchJson(`https://api.ashbyhq.com/posting-api/job-board/${company.board}`);
      return (data.jobs ?? []).map((job: Record<string, unknown>) => makeJob(company, {
        id: job.id as string,
        title: job.title as string,
        location: [job.location, ...(Array.isArray(job.secondaryLocations) ? job.secondaryLocations : [])].filter(Boolean).join("; "),
        workplaceType: job.workplaceType as string | undefined,
        isRemote: job.isRemote as boolean | undefined,
        url: (job.jobUrl ?? job.applyUrl) as string,
        department: (job.department ?? job.team) as string | undefined,
        postedAt: job.publishedAt as string | undefined,
        description: (job.descriptionHtml ?? job.description) as string | undefined,
      })).filter((job: Job | null): job is Job => Boolean(job));
    }
    const data = await fetchJson(`https://api.lever.co/v0/postings/${company.board}?mode=json`);
    return (data ?? []).map((job: Record<string, unknown>) => {
      const categories = job.categories as Record<string, string> | undefined;
      return makeJob(company, {
        id: job.id as string,
        title: job.text as string,
        location: (job.location as string) ?? categories?.location,
        workplaceType: job.workplaceType as string | undefined,
        url: (job.hostedUrl ?? job.applyUrl) as string,
        department: categories?.team ?? categories?.department,
        postedAt: job.createdAt as string | undefined,
        description: job.descriptionPlain as string | undefined,
      });
    }).filter((job: Job | null): job is Job => Boolean(job));
}

export async function getJobs() {
  const results = await Promise.all(companies.map(async (company) => {
    try {
      return { jobs: await fetchCompany(company), healthy: true };
    } catch {
      return { jobs: [], healthy: false };
    }
  }));
  const jobs = results.flatMap((result) => result.jobs);
  const uniqueJobs = [...new Map(jobs.map((job) => [job.id, job])).values()];
  uniqueJobs.sort((a, b) => Date.parse(b.postedAt ?? "") - Date.parse(a.postedAt ?? ""));
  return {
    jobs: uniqueJobs,
    refreshedAt: new Date().toISOString(),
    sources: { total: companies.length, healthy: results.filter((result) => result.healthy).length },
  };
}
