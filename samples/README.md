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
You can download any sample file, edit it and run the tool to match your project.

To download use `wget https://github.com/krushndayshmookh/csv-to-issues/tree/main/samples/bugs.csv`

