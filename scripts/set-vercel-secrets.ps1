Param(
    [Parameter(Mandatory=$true)][string]$VercelToken,
    [Parameter(Mandatory=$true)][string]$VercelOrgId,
    [Parameter(Mandatory=$true)][string]$VercelProjectId
)

Write-Host "Setting GitHub secrets using gh CLI..."

gh secret set VERCEL_TOKEN --body $VercelToken
gh secret set VERCEL_ORG_ID --body $VercelOrgId
gh secret set VERCEL_PROJECT_ID --body $VercelProjectId

Write-Host "Done. Confirm secrets in your repository settings on GitHub."
