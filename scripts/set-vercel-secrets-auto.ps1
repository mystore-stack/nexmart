Param(
    [Parameter(Mandatory=$true)][string]$VercelToken,
    [string]$ProjectName
)

Write-Host "Detecting current GitHub repo..."
$repoInfo = gh repo view --json nameWithOwner --jq .nameWithOwner 2>$null
if (-not $repoInfo) {
    Write-Error "gh CLI not authenticated or not in a git repo. Run 'gh auth login' and run this inside the repo."
    exit 1
}

$repoFull = $repoInfo.Trim()
$repoName = ($repoFull -split '/')[1]

Write-Host "Querying Vercel projects..."
$headers = @{ Authorization = "Bearer $VercelToken" }
try {
    $resp = Invoke-RestMethod -Uri "https://api.vercel.com/v1/projects" -Headers $headers -Method Get
} catch {
    Write-Error "Failed to call Vercel API. Check token and network. $_"
    exit 1
}

$projects = $resp.projects
if (-not $projects) {
    Write-Error "No projects returned from Vercel API."
    exit 1
}

Write-Host "Searching for matching project..."
$project = $null
if ($ProjectName) {
    $project = $projects | Where-Object { $_.name -eq $ProjectName } | Select-Object -First 1
}
if (-not $project) {
    $project = $projects | Where-Object {
        ($_.gitRepository -ne $null -and (
            ($_.gitRepository.repo -eq $repoName) -or ($_.gitRepository.full_name -eq $repoFull)
        )) -or ($_.name -eq $repoName)
    } | Select-Object -First 1
}

if (-not $project) {
    Write-Host "No single matching project found. Candidates:"
    $projects | ForEach-Object { Write-Host ("{0}  {1}  repo:{2}" -f $_.id, $_.name, ($_.gitRepository.repo -as [string])) }
    Write-Error "No matching project. Re-run with -ProjectName <name> to choose explicitly."
    exit 1
}

$projectId = $project.id
$orgId = $project.teamId
if (-not $orgId -and $project.psobject.properties.name -contains 'orgId') { $orgId = $project.orgId }

Write-Host "Found project: $($project.name) (id: $projectId) team/org: $orgId"

Write-Host "Setting GitHub secrets via gh CLI..."
gh secret set VERCEL_TOKEN --body $VercelToken
gh secret set VERCEL_PROJECT_ID --body $projectId
if ($orgId) { gh secret set VERCEL_ORG_ID --body $orgId } else { Write-Host "No org/team id available; skipped VERCEL_ORG_ID." }

Write-Host "Done. Verify secrets in your repository Settings → Secrets." 
