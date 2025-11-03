# Commands And Procedures

1. [Cloning The Repository and getting started](#cloning-the-repository-and-getting-started)
2. [Submitting a Pull Request](#submitting-a-pull-request)
3. [Install And Run Audit Locally](#install-and-run-audit-locally)

## Cloning The Repository and getting started

### Who this is for

This guide is written for non-developers (translators, QA, community contributors) who want to update particularly the json files — without needing deep programming knowledge.

### Prerequisites

- A terminal (Command Prompt, PowerShell, Terminal, etc.)
- [Git](https://git-scm.com/downloads) installed

    - Windows: install Git for Windows from the official site (use default options).
    - macOS: `brew install git` if you use Homebrew, or install from the official package.
    - Linux: use your package manager, e.g. `sudo apt install git`.

    After install, configure your name/email (only once):
    ``` powershell
    git config --global user.name "Your Full Name"
    git config --global user.email "you@example.com"
    ```
- A GitHub account
- An IDE or text editor that supports JSON formatting (e.g., [Visual Studio Code](https://code.visualstudio.com/), [Sublime Text](https://www.sublimetext.com/), [Notepad++](https://notepad-plus-plus.org/downloads/))

### Steps

1. **Fork the Repository**: Go to the GitHub page of this repository and click on the "Fork" button at the top right corner. This will create a copy of the repository under your GitHub account.

2. **Clone Your Fork**: Once you have forked the repository find the "<> Code" button on your forked repository page, click it, and copy the URL.
Then, open your terminal where you want to store the repository locally and run:
   ``` powershell
   git clone <your-forked-repo-url> # Replace with your fork URL
   ```
    You can now navigate in your terminal to the cloned repository folder and start browsing files.

3. **Keep Your Fork Updated**: Regularly sync your fork with the upstream repository to stay updated with the latest changes. To do this find the "Sync fork" button on your forked repository page and click it.

4. **Create a New Branch**: Before making any changes, create a new branch to work on. A branch is a separate line of development that allows you to make changes without affecting the main codebase.
This helps keep your changes organized and makes it easier to submit your changes later. In your terminal, run:
   ``` powershell
   git checkout -b my-locale-update # Replace 'my-locale-update' with a descriptive branch name
   ```
   You are now on a new branch where you can make your changes.

5. **Make Your Changes**: Open the localization files you want to edit in your preferred text editor or IDE. Follow the guidelines in the [CONTRIBUTING.md](./CONTRIBUTING.md) document to ensure your changes are correct.

6. **Commit Your Changes**: After making your changes, save the files and return to your terminal. Stage the changes for commit by running:
   ``` powershell
   git add . # Stages all changed files; you can also specify individual files
   ```
   Then, commit the changes with a descriptive message:
   ``` powershell
   git commit -m "Fixed liquids descriptions in de-DE" # Add a short descriptive message: a message is always required and can be read by others
   git push # Push your changes to the remote repository
   ```
Repeat steps 5 and 6 as needed to make further changes. More frequent, smaller commits are generally preferred.

> If using an IDE such as Visual Studio Code, you can use its built-in Git interface to stage, commit, and push changes without using the terminal. This can be more user-friendly for those unfamiliar with command-line Git.

## Submitting a Pull Request

A Pull Request (PR) is a way to propose your changes to the original repository. Once you have committed and pushed your changes to your forked repository, you can submit a PR to the main repository.

1. Go to your forked repository on GitHub.

2. You should see a notification about your recently pushed branch with a "Compare & pull request" button. Click it. If you don't see this notification, you can manually navigate to the "Pull requests" tab and click the "New pull request" button. Then select your branch from the dropdown menu.

3. Review the changes you made and ensure everything looks correct.

4. Add a descriptive title and comment for your PR, explaining what changes you made and why.

5. Click the "Create pull request" button to submit your PR.
The maintainers of the original repository will review your PR and may provide feedback or request changes before merging it into the main codebase.

You can always update your PR by making additional commits to the same branch in your forked repository. These changes will automatically be reflected in the PR.

> So as to not flood the maintainers with too many PRs, try to have one PR to the main repository a month maximum, unless you are fixing critical issues.

## Install And Run Audit Locally

### Prerequisites

- [Node.js](https://nodejs.org/en/download/) installed (version 14 or higher)
- A terminal (Command Prompt, PowerShell, Terminal, etc.)

### Steps

In the root of the repository, run the following commands:
``` powershell
cd Tools # Navigate to the Tools folder
npm ci # Install dependencies
npm run analyze # Run the localization audit
```

On Windows, if execution policy prevents running the script, try running this command in PowerShell first:

``` powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```
The analysis results will be available as a markdown file in the `reports` folder. Please revert any updates to the `README.md` and `index.json` files before committing, as they should only be updated by the GitHub Actions workflow.