// Flattens validation issues into one message per field path (dot-separated), as the screens expect.
export function zodIssues(error: { issues: { path: PropertyKey[]; message: string }[] }) {
  const issues: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.map(String).join(".") || "form";
    if (!issues[key]) issues[key] = issue.message;
  }
  return issues;
}
