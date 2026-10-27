// Applications (candidaturas) do not exist yet; they arrive with the application specs.
// Until then no job has applications, so the edit lock of OPEN-022 and the "active candidates" list on closing
// are inactive. These two functions are the single place to connect the future application model.
export async function jobHasApplications(_jobId: string): Promise<boolean> {
  return false;
}

export async function listActiveCandidatesForJob(_jobId: string): Promise<string[]> {
  return [];
}
