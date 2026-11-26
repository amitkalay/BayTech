import { getJobs } from "@/lib/jobs";

export const maxDuration = 60;

export async function GET(request: Request) {
  // Read request headers so the handler always runs at request time; feed data is cached independently.
  request.headers.get("x-vercel-cron-schedule");
  const data = await getJobs();
  return Response.json(data, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
