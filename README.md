# BayTech

BayTech is a map-first job finder for software engineering and forward deployed engineering roles in San Francisco and the Peninsula. It shows on-site and hybrid positions and links candidates to the employer's original application page.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Job feeds

The server reads public Greenhouse, Ashby, and Lever job boards listed in `lib/jobs.ts`. It keeps only engineering titles with an office location in San Francisco or the Peninsula, and excludes listings that the career board or title explicitly marks as remote. Some boards do not publish a work-arrangement field, so a local office location is shown without claiming a specific in-office schedule. Feed responses are cached for six hours; a scheduled GitHub Action requests `/api/jobs` every six hours to refresh the feeds. Job applications always go to the employer's own site.

To add a company, add its public board name, ATS type, and display name to the `companies` list in `lib/jobs.ts`.

## Map

The interactive map uses OpenStreetMap tiles and includes OpenStreetMap attribution. Markers are grouped by city because most career feeds publish a city rather than an exact street address.
