param(
  [string]$branch = "feat/admin-userlist-delete",
  [string]$message = "admin: add UserList delete confirmation + Playwright tests"
)

Write-Host "Creating branch $branch and pushing to origin..."
git checkout -b $branch
git add -A
git commit -m $message
git push -u origin $branch

Write-Host "Pushed branch $branch. Open a PR on GitHub to run CI."
