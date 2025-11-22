# ===========================================
# EVA Framework - NPM Publish Script (PowerShell)
# ===========================================

Write-Host "EVA Framework - Publication sur NPM" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Check if logged in to npm
Write-Host "Verification de la connexion NPM..." -ForegroundColor Yellow
$npmUser = npm whoami 2>&1 | Out-String
if ($LASTEXITCODE -ne 0) {
    Write-Host "Erreur: Vous n etes pas connecte a NPM" -ForegroundColor Red
    Write-Host "Veuillez vous connecter avec: npm login" -ForegroundColor Yellow
    exit 1
}
Write-Host "Connecte en tant que: $($npmUser.Trim())" -ForegroundColor Green
Write-Host ""

# Build eva-css
Write-Host "Build de @eva/css..." -ForegroundColor Yellow
Push-Location packages\eva-css
$null = pnpm build 2>&1
$null = pnpm build:min 2>&1
Write-Host "Build termine" -ForegroundColor Green
Pop-Location
Write-Host ""

# Simple package info
Write-Host "Packages a publier:" -ForegroundColor Yellow
Write-Host "  - eva-colors v1.0.4" -ForegroundColor Cyan
Write-Host "  - eva-css-fluid v1.0.4" -ForegroundColor Cyan
Write-Host "  - eva-css-purge v1.0.4" -ForegroundColor Cyan
Write-Host ""

Write-Host "Etes-vous pret a publier ces packages sur NPM ?" -ForegroundColor Yellow
Write-Host "Cette action est irreversible !" -ForegroundColor Yellow
Write-Host ""
$confirmation = Read-Host "Taper yes pour continuer"

if ($confirmation -ne "yes") {
    Write-Host "Publication annulee" -ForegroundColor Red
    exit 1
}

# Publish packages
Write-Host ""
Write-Host "Publication des packages..." -ForegroundColor Yellow
Write-Host ""

Write-Host "  Publishing eva-colors..." -ForegroundColor Cyan
Push-Location packages\eva-colors
npm publish
if ($LASTEXITCODE -eq 0) {
    Write-Host "  eva-colors publie avec succes" -ForegroundColor Green
}
else {
    Write-Host "  Erreur lors de la publication de eva-colors" -ForegroundColor Red
    Pop-Location
    exit 1
}
Pop-Location

Write-Host "  Publishing eva-css-fluid..." -ForegroundColor Cyan
Push-Location packages\eva-css
npm publish
if ($LASTEXITCODE -eq 0) {
    Write-Host "  eva-css-fluid publie avec succes" -ForegroundColor Green
}
else {
    Write-Host "  Erreur lors de la publication de eva-css-fluid" -ForegroundColor Red
    Pop-Location
    exit 1
}
Pop-Location

Write-Host "  Publishing eva-css-purge..." -ForegroundColor Cyan
Push-Location packages\eva-purge
npm publish
if ($LASTEXITCODE -eq 0) {
    Write-Host "  eva-css-purge publie avec succes" -ForegroundColor Green
}
else {
    Write-Host "  Erreur lors de la publication de eva-css-purge" -ForegroundColor Red
    Pop-Location
    exit 1
}
Pop-Location

Write-Host ""
Write-Host "Tous les packages ont ete publies avec succes !" -ForegroundColor Green
Write-Host ""
Write-Host "Prochaines etapes recommandees:" -ForegroundColor Cyan
Write-Host "   1. Creer un tag git: git tag v1.0.4 && git push --tags"
Write-Host "   2. Verifier sur NPM:"
Write-Host "      - https://www.npmjs.com/package/eva-colors"
Write-Host "      - https://www.npmjs.com/package/eva-css-fluid"
Write-Host "      - https://www.npmjs.com/package/eva-css-purge"
Write-Host ""
