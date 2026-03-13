# Contributing

## Quick merge guide (when GitHub says there are conflicts)

If your PR branch is behind `main`, run these commands locally:

```bash
git fetch origin
git checkout <your-branch>
git rebase origin/main
```

If conflicts appear:

1. See conflicted files:

```bash
git status
```

2. Open each conflicted file and remove conflict markers:

```text
<<<<< HEAD
...
=====
...
>>>>> origin/main
```

3. For this repo, keep these rules to reduce repeat conflicts:
- Keep the root `index.html` as a tiny redirect only.
- Keep real app markup in `app/index.html`.
- Keep app logic in `app/app.js`.

4. Mark each file as resolved and continue rebase:

```bash
git add <resolved-file-1> <resolved-file-2>
git rebase --continue
```

5. If you want to stop and retry:

```bash
git rebase --abort
```

6. Push updated branch:

```bash
git push --force-with-lease
```

## Conflict triage shortcuts

- Prefer your current branch version ("ours") for a file:

```bash
git checkout --ours <file>
git add <file>
```

- Prefer incoming branch version ("theirs") for a file:

```bash
git checkout --theirs <file>
git add <file>
```

- Then continue:

```bash
git rebase --continue
```

## GitHub UI fallback

If you must resolve in GitHub UI:

1. Click **Resolve conflicts** on the PR.
2. Keep `index.html` as redirect only.
3. Keep full app UI in `app/index.html`.
4. Mark resolved and commit.

This keeps future merges much cleaner.
