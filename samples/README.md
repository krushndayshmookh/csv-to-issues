## Samples

Use these CSVs as starting points for common workflows. The tool expects headers:

```csv
Title, Description, Priority, Type, Labels, Difficulty, Component
```

- **bugs.csv**: Realistic bug reports
- **features.csv**: Feature/enhancement requests
- **hacktoberfest.csv**: Beginner-friendly issues with `hacktoberfest` context

### Running with a sample

```bash
GITHUB_TOKEN=your_pat_here CSV_FILE=./samples/bugs.csv npx csv-to-issues owner/repo
```

You can duplicate and edit any sample to match your project.

