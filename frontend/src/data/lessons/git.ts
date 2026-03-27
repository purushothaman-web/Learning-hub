import type { Lesson } from '../../types/curriculum';

export const gitLessons: Lesson[] = [
  {
    id: 'git_0',
    title: 'Version Control Mental Model',
    badge: 'Foundations',
    badgeClass: 'badge-concept',
    content: [
      '**Git** is not just a tool for "saving files"; it is a distributed version control system that records a timeline of changes. Each "Commit" is a snapshot of your entire project at a specific moment in time.',
      'Unlike cloud storage (like Google Drive or Dropbox), Git allows you to branch off into parallel universes. You can work on a "new-feature" while a teammate fixes a "critical-bug" on the "main" branch, and then merge your changes back together later.',
      'The "Staging Area" (The Index) is the most important concept. You don\'t just save everything; you choose which specific changes to "add" to your next commit. This allows you to create clean, meaningful commits that tell a clear story of your project\'s growth.'
    ],
    code: `// ── The Git Workflow ──
// 1. Working Directory (Live files)
//      |   git add
//      v
// 2. Staging Area (Selection)
//      |   git commit
//      v
// 3. Local Repo (Snapshots)
//      |   git push
//      v
// 4. Remote Repo (GitHub/Lab)`
  },
  {
    id: 'git_1',
    title: 'Commits: The Project Heartbeat',
    badge: 'Practice',
    badgeClass: 'badge-practice',
    content: [
      'A great commit message is a gift to your future self. Instead of "fixed things", use the imperative mood: "Fix login overflow bug" or "Add TypeScript types to User model". A clear history makes it easy to find exactly when a bug was introduced.',
      'Atomicity: One commit should do one thing. Don\'t fix a typo, refactor a function, and add a new feature in a single commit. If the new feature breaks everything, you want to be able to "Revert" just that one change without losing your other work.',
      'SHAs (Hashes): Every commit has a unique 40-character ID. You can use these IDs to jump back in time, compare different versions of your code, or "Cherry-pick" a single fix from another branch.'
    ],
    code: `# ── Professional Commit Log ──

# ✅ Good: Descriptive & Atomic
git commit -m "refactor(auth): move JWT logic to custom hook"

# ❌ Bad: Vague & Huge
git commit -m "updates"

# ── View History ──
git log --oneline --graph`
  },
  {
    id: 'git_2',
    title: 'Branching & Parallel Streams',
    badge: 'Core',
    badgeClass: 'badge-concept',
    content: [
      '**Branching** is virtually free in Git. A branch is just a "pointer" to a specific commit. You should create a new branch for every single feature or bug fix you work on. This keeps the "main" branch stable and ready for production at all times.',
      'When you finish a task, you use a **Merge** to bring your changes back to the main path. Git is smart: it calculates only the differences between the two paths and applies them automatically in most cases.',
      '**Merge Conflicts** happen when two people edit the same line of the same file. Don\'t panic! Git pauses and asks YOU to decide which version is correct. It\'s just a normal part of collaboration in a modern software team.'
    ],
    code: `# ── Branching workflow ──

# 1. Start new work
git checkout -b feature/user-profile

# 2 ... edit/add/commit ...

# 3. Switch to main
git checkout main

# 4. Integrate work
git merge feature/user-profile

# 5. Cleanup
git branch -d feature/user-profile`
  },
  {
    id: 'git_3',
    title: 'Remotes & Collaboration (GitHub)',
    badge: 'Collaboration',
    badgeClass: 'badge-concept',
    content: [
      'Git is distributed, meaning every developer has a full copy of the project. **Remotes** are versions of your project hosted on the internet (like GitHub, GitLab, or Bitbucket). You "Push" your local commits to the remote and "Pull" your teammates\' commits.',
      '**Pull Requests (PRs)** are the heart of the modern developer workflow. A PR is a request to merge your branch into "main". It provides a UI for code review, where teammates can leave comments, request changes, and verify that your tests pass.',
      'The "Fork & Pull" model: In open source, you usually don\'t have permission to edit the main repo. Instead, you "Fork" (copy) it to your account, make changes, and then submit a "Pull Request" to the original owner.'
    ],
    code: `# ── Team Sync ──

# 1. Update from remote
git pull origin main

# 2. Share your work
git push origin feature/new-api

# ── Add a remote ──
git remote add origin https://github.com/user/repo.git`
  },
  {
    id: 'git_4',
    title: 'Undoing Things: Reset & Revert',
    badge: 'Core',
    badgeClass: 'badge-practice',
    content: [
      'Git never truly forgets. If you make a mistake, you have several ways to fix it. `git checkout` can restore a single file to its previous state. `git commit --amend` can fix a typo in your last commit.',
      '**Reset** (Dangerous): Moves the branch pointer back in time. `git reset --hard` completely deletes your local changes. Use this only if you want to throw away your recent work and start over from a clean state.',
      '**Revert** (Safe): Creates a NEW commit that does the exact opposite of a previous commit. This is the preferred way to undo things on a shared branch because it doesn\'t rewrite history — it just adds a new entry that fixes the mistake.'
    ],
    code: `# ── Undoing locally ──
git checkout -- src/App.tsx  # Restore file

# ── The "Oh No" Command ──
git reset --hard HEAD~1    # Delete last commit (BE CAREFUL)

# ── Undoing on a team branch ──
git revert <commit-id>     # Safely subtract changes`
  },
  {
    id: 'git_5',
    title: 'The Rebase Strategy',
    badge: 'Advanced',
    badgeClass: 'badge-concept',
    content: [
      '**Rebase** is an alternative to Merge. Instead of creating a "Merge Commit" (which can look messy), Rebase takes your changes and "replays" them on top of the latest version of the main branch. This creates a perfectly flat, linear history.',
      'The Golden Rule: **Never rebase a public branch.** If other people are working on the same branch, rebasing will break their local repos because it replaces existing commits with new ones. Use rebase only for your local private feature branches.',
      'Interactive Rebase (`-i`) is a superpower. It allows you to "Squash" (combine) 10 small, messy commits into one clean, professional commit before you merge. It\'s like editing your first draft before publishing the final book.'
    ],
    code: `# ── Linear history with rebase ──
git checkout feature/api
git rebase main

# ── Cleanup with Interactive Rebase ──
# (Allows you to 'squash' or 'fixup' commits)
git rebase -i HEAD~5`
  },
  {
    id: 'git_6',
    title: 'Git Internals: The .git folder',
    badge: 'Deep Dive',
    badgeClass: 'badge-concept',
    content: [
      'Everything Git knows is stored in the hidden `.git` folder in your project root. Inside, you\'ll find `objects` (the actual data), `refs` (the pointers to branches), and `HEAD` (where you are currently looking).',
      'Git is essentially a "Content-Addressable Filesystem". It takes a file, runs it through a SHA-1 hash, and stores it by that hash. If two files have the exact same content, Git only stores one copy. This is why Git is so efficient at handling large projects.',
      'Understanding that branches are just text files in `.git/refs/heads` removes the "Magic" from Git. You aren\'t just using a tool; you are manipulating a simple, elegant graph of data.'
    ],
    code: `# ── Peek inside the pointer ──
cat .git/HEAD
# Ref: refs/heads/main

# ── See exactly what is in a commit ──
git cat-file -p <commit-sha>`
  },
  {
    id: 'git_7',
    title: 'Project Execution: Clean Collaboration',
    badge: 'Project',
    badgeClass: 'badge-practice',
    content: [
      'In this task, you will demonstrate a professional Git workflow. You will create a feature branch, resolve a intentional merge conflict with "main", and use an interactive rebase to clean up your commit history before "submitting" your PR.',
      'The goal is to show that you can maintain a clean, readable project history while collaborating with others. You must also write atomic, meaningful commit messages using the standard Git conventions.',
      '**Studio Task**: Finish the "JobTrackr" login fix. Implement the code, commit with a clear message, rebase it on top of the latest `main`, and prepare the branch for merge.'
    ],
    code: `# ── Final Workflow Checklist ──
# 1. Feature branch created?    [Yes]
# 2. Commits are atomic?       [Yes]
# 3. History squashed/cleaned? [Yes]
# 4. Verified with git log?    [Yes]`
  }
];
