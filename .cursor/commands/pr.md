Review the current branch changes and prepare a summary of them.
Instructions
You are reviewing the current branch. Follow these steps:
Run `git status` and `git diff` to understand the current branch changes
Check if the current branch tracks a remote branch and if it needs to be pushed
Run `git log` and `git diff [base-branch]...HEAD` to understand all commits in this branch
Analyze ALL changes to draft a comprehensive change summary

Summary Template
```markdown
## Description
<!--- Describe your changes in detail -->

## Related Issue
<!--- Put the issue link here if you are fixing an issue -->
## Motivation and Context
<!--- Why is this change required? What problem does it solve? -->
<!--- If it fixes an open issue, please link to the issue here. -->

## How has this been tested?
<!--- Please describe in detail how you tested your changes. -->
<!--- Include details of your testing environment, tests ran to see how -->
<!--- your change affects other areas of the code, etc. -->

## Screenshots (if appropriate):

## Types of changes
<!--- What types of changes does your code introduce? Put an `x` in all the boxes that apply: -->

- [ ] fix: used when there is correction of errors that are generating bugs in the system.
- [ ] feat: indicates the development of a new feature for the project.
- [ ] perf: indicates a change that improved system performance.
- [ ] test: indicates any type of creation or change of test codes.
- [ ] refactor: used when there is a code refactoring that does not have any type of impact on the system's business logic/rules.
- [ ] style: used when there are formatting and code style changes that do not alter the system in any way.
- [ ] chore: indicates changes to the project that do not affect the system or test files.
- [ ] docs: used when there are changes to the project documentation.
- [ ] build: used to indicate changes that affect the project's build process or external dependencies.
- [ ] ci: used for changes to CI configuration files.
- [ ] revert: indicates the revert of a previous commit

## Checklist:
- [ ] My code follows the code style of this project.
- [ ] My change requires a change to the documentation.
- [ ] I have updated the documentation accordingly.
- [ ] I have added tests to cover my changes.
- [ ] All new and existing tests passed.