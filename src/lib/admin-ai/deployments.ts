import type { DeploymentRecord } from "./types";

type VercelDeployment = {
  uid: string;
  url: string;
  state?: DeploymentRecord["state"];
  createdAt?: number;
  target?: string;
  creator?: { username?: string; email?: string };
  meta?: Record<string, string>;
};

function envDeployment(): DeploymentRecord[] {
  const url = process.env.VERCEL_URL || process.env.NEXT_PUBLIC_APP_URL || "localhost";
  return [{
    id: process.env.VERCEL_GIT_COMMIT_SHA || "local",
    url,
    state: process.env.VERCEL ? "READY" : "UNKNOWN",
    createdAt: new Date().toISOString(),
    target: process.env.VERCEL_ENV || process.env.NODE_ENV,
    creator: process.env.VERCEL_GIT_COMMIT_AUTHOR_NAME || "Local environment",
    source: "environment",
  }];
}

export async function getDeployments(): Promise<DeploymentRecord[]> {
  const token = process.env.VERCEL_API_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;
  const teamId = process.env.VERCEL_TEAM_ID;

  if (!token || !projectId) return envDeployment();

  const url = new URL("https://api.vercel.com/v6/deployments");
  url.searchParams.set("projectId", projectId);
  url.searchParams.set("limit", "8");
  if (teamId) url.searchParams.set("teamId", teamId);

  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 30 },
    });
    if (!response.ok) return envDeployment();

    const data = await response.json();
    return ((data.deployments || []) as VercelDeployment[]).map((deployment) => ({
      id: deployment.uid,
      url: deployment.url,
      state: deployment.state || "UNKNOWN",
      createdAt: deployment.createdAt ? new Date(deployment.createdAt).toISOString() : new Date().toISOString(),
      target: deployment.target,
      creator: deployment.creator?.username || deployment.creator?.email,
      source: "vercel",
      buildError: deployment.state === "ERROR" ? deployment.meta?.errorMessage || "Vercel reported a failed deployment." : undefined,
    }));
  } catch {
    return envDeployment();
  }
}
