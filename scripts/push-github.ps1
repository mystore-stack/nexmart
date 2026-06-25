# Publie le code sur https://github.com/mystore-stack/nexmart
# Compte GitHub requis : mystore-stack (pas rafatima493-dotcom)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

Write-Host "Remote actuel :" -ForegroundColor Cyan
git remote -v

Write-Host ""
Write-Host "Si le push echoue (403), connectez-vous au compte mystore-stack :" -ForegroundColor Yellow
Write-Host "  1. Ouvrez https://github.com/settings/tokens" -ForegroundColor Gray
Write-Host "  2. Creez un token (scope: repo)" -ForegroundColor Gray
Write-Host "  3. Executez :" -ForegroundColor Gray
Write-Host '     git remote set-url origin https://mystore-stack:<VOTRE_TOKEN>@github.com/mystore-stack/nexmart.git' -ForegroundColor White
Write-Host "  4. Relancez ce script" -ForegroundColor Gray
Write-Host ""

git push -u origin main

if ($LASTEXITCODE -eq 0) {
  Write-Host ""
  Write-Host "OK - Code publie sur GitHub." -ForegroundColor Green
  Write-Host "Deploiement auto : chaque push sur main declenche GitHub Actions -> Vercel" -ForegroundColor Green
  Write-Host "Vercel deploie automatiquement : https://vercel.com/you-store-s-projects/nexmart" -ForegroundColor Cyan
}
