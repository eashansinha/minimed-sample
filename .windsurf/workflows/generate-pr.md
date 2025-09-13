---
description: Workflow for creating a new pull request
auto_execution_mode: 1
---

# Generate PR Workflow

1. If there are un-committed changes, then Call /commit-changes OR commit with a descriptive message:
```bash
git commit -am "descriptive commit message"
```

2. Check what changes were made in this branch:
```bash
git diff main
```

3. Create PR using the template:
```bash
# Create PR with proper escaping for code references
gh pr create --title "Title In Capital Case" --body $'PR body following template'
```

Important notes:
- Title should be in Capital Case (e.g. "Make Cascade Better")
- PR must follow the template github_pr_template defined below.
- Leave testing section as TODO.
- Use single quotes with $' syntax for the PR body to ensure proper escaping of special characters and newlines. Use real newline characters.
- Explicitly specify `--base`, `--head`, `--repo`, and `--web=false` to avoid interactive prompts.
- Create PRs as drafts by default using the `--draft` flag unless otherwise specified.
- Do NOT research around and try to understand the user's changes. Just look at the contents of the diff.

<github_pr_template>
Summary
=======
Write a 1-2 sentence summary of what this PR does.

Changes
=======
For large PRs, write some bullet points about what the PR does. Please note anything that the reviewer should be especially aware of.

Documentation
=============
List any relevant documents related to this change. Here are some potential things worth documenting:
- Is the code itself documented reasonably well? Note that high level architecture documentation is usually better in a separate document.
- How will people know how to build on top of this? What should they be careful to avoid breaking? Should a system architecture document be created / updated?
- Was there any complex process used to develop this change that others may want to use in the future?
- If this is an internal tool or system, what new information do users of this tool/system need to know?
- If this affects our production systems or release processes, what runbooks need to be updated?
- If this is a data pipeline, is there documentation about what datasets were produced, what they contain, and how to regenerate them?
- If this is related to a research experiment, are the results of that research recorded somewhere?