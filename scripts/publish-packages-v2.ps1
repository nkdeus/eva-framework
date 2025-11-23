# ===========================================
# EVA Framework - NPM Publish Script v2 (PowerShell)
# With automatic version bump
# ===========================================

# Ne pas arrêter sur les warnings npm
$ErrorActionPreference = "Continue"

Write-Host ""
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

# Define packages
$packages = @{
    "eva-colors" = "packages\eva-colors"
    "eva-css-fluid" = "packages\eva-css"
    "eva-css-purge" = "packages\eva-purge"
    "create-eva-css" = "packages\create-eva-css"
}

$currentVersions = @{}
$newVersions = @{}

# Get current versions
Write-Host "Versions actuelles des packages:" -ForegroundColor Yellow
Write-Host ""

foreach ($pkgName in $packages.Keys) {
    $pkgPath = $packages[$pkgName]
    $packageJson = Get-Content "$pkgPath\package.json" | ConvertFrom-Json
    $currentVersions[$pkgName] = $packageJson.version
    Write-Host "  $pkgName : v$($packageJson.version)" -ForegroundColor Cyan
}

Write-Host ""

# Ask for version bump type
Write-Host "Quel type de version bump souhaitez-vous ?" -ForegroundColor Yellow
Write-Host ""
Write-Host "  1) patch   - 2.0.0 -> 2.0.1 (bug fixes)"
Write-Host "  2) minor   - 2.0.0 -> 2.1.0 (new features, backwards compatible)"
Write-Host "  3) major   - 2.0.0 -> 3.0.0 (breaking changes)"
Write-Host "  4) custom  - Specifier une version manuellement"
Write-Host "  5) skip    - Garder les versions actuelles (ne pas bumper)"
Write-Host ""
$versionChoice = Read-Host "Votre choix (1-5)"
Write-Host ""

$bumpType = ""
$customVersion = ""

switch ($versionChoice) {
    "1" {
        $bumpType = "patch"
        Write-Host "Version bump: patch" -ForegroundColor Green
    }
    "2" {
        $bumpType = "minor"
        Write-Host "Version bump: minor" -ForegroundColor Green
    }
    "3" {
        $bumpType = "major"
        Write-Host "Version bump: major" -ForegroundColor Green
    }
    "4" {
        $customVersion = Read-Host "Nouvelle version (ex: 2.1.0)"
        if ($customVersion -notmatch '^\d+\.\d+\.\d+$') {
            Write-Host "Format de version invalide" -ForegroundColor Red
            exit 1
        }
        Write-Host "Version custom: $customVersion" -ForegroundColor Green
    }
    "5" {
        Write-Host "Versions actuelles conservees" -ForegroundColor Yellow
    }
    default {
        Write-Host "Choix invalide" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""

# Bump versions if needed
if ($bumpType -or $customVersion) {
    Write-Host "Mise a jour des versions..." -ForegroundColor Yellow
    Write-Host ""

    foreach ($pkgName in $packages.Keys) {
        $pkgPath = $packages[$pkgName]

        Push-Location $pkgPath

        if ($customVersion) {
            $newVersion = $customVersion
            npm version $customVersion --no-git-tag-version | Out-Null
        } else {
            $versionOutput = npm version $bumpType --no-git-tag-version 2>&1
            $newVersion = ($versionOutput -replace 'v', '')
        }

        Pop-Location

        $newVersions[$pkgName] = $newVersion
        Write-Host "  $pkgName : $($currentVersions[$pkgName]) -> $newVersion" -ForegroundColor Green
    }

    Write-Host ""

    # Update cross-package dependencies
    Write-Host "Mise a jour des dependances inter-packages..." -ForegroundColor Yellow

    if ($newVersions["eva-colors"]) {
        $evaColorsVersion = $newVersions["eva-colors"]
        Push-Location packages\eva-css

        $packageJson = Get-Content "package.json" | ConvertFrom-Json
        if (-not $packageJson.dependencies) {
            $packageJson | Add-Member -MemberType NoteProperty -Name dependencies -Value @{}
        }
        $packageJson.dependencies."eva-colors" = "^$evaColorsVersion"
        $packageJson | ConvertTo-Json -Depth 10 | Set-Content "package.json"

        Write-Host "  eva-css-fluid -> eva-colors: ^$evaColorsVersion" -ForegroundColor Green
        Pop-Location
    }

    Write-Host ""
}

# Build eva-css
Write-Host "Build de eva-css-fluid..." -ForegroundColor Yellow
Push-Location packages\eva-css
$null = pnpm build 2>&1
$null = pnpm build:min 2>&1
Write-Host "Build termine" -ForegroundColor Green
Pop-Location
Write-Host ""

# Verify package contents
Write-Host "Verification des packages..." -ForegroundColor Yellow
Write-Host ""

foreach ($pkgName in $packages.Keys) {
    $pkgPath = $packages[$pkgName]
    Write-Host "  $pkgName :" -ForegroundColor Cyan
    Push-Location $pkgPath

    try {
        $packOutput = npm pack --dry-run 2>&1 | Out-String
        $packOutput -split "`n" | Where-Object { $_ -match "package size|total files" } | ForEach-Object {
            $line = $_ -replace 'npm notice ', ''
            Write-Host "    $line"
        }
    } catch {
        Write-Host "    (informations non disponibles)" -ForegroundColor Gray
    }

    Pop-Location
}

Write-Host ""

# Show summary
Write-Host "================================================" -ForegroundColor Blue
Write-Host "RESUME DE LA PUBLICATION" -ForegroundColor Blue
Write-Host "================================================" -ForegroundColor Blue
Write-Host ""

foreach ($pkgName in $packages.Keys) {
    if ($newVersions[$pkgName]) {
        Write-Host "  $pkgName : $($currentVersions[$pkgName]) -> $($newVersions[$pkgName])" -ForegroundColor Green
    } else {
        Write-Host "  $pkgName : $($currentVersions[$pkgName]) (inchange)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Etes-vous pret a publier ces packages sur NPM ?" -ForegroundColor Yellow
Write-Host "Cette action est irreversible !" -ForegroundColor Yellow
Write-Host ""
$confirmation = Read-Host "Taper yes pour continuer"

if ($confirmation -ne "yes") {
    Write-Host "Publication annulee" -ForegroundColor Red

    # Revert version changes
    if ($bumpType -or $customVersion) {
        Write-Host "Annulation des changements de version..." -ForegroundColor Yellow
        git checkout packages\*\package.json 2>$null
    }

    exit 1
}

# Publish packages
Write-Host ""
Write-Host "Publication des packages..." -ForegroundColor Yellow
Write-Host ""

$publishedCount = 0
$failedCount = 0

foreach ($pkgName in $packages.Keys) {
    $pkgPath = $packages[$pkgName]

    Write-Host "  Publishing $pkgName ..." -ForegroundColor Cyan
    Push-Location $pkgPath

    # Publish interactively to allow npm to handle authentication
    npm publish
    $exitCode = $LASTEXITCODE

    if ($exitCode -eq 0) {
        Write-Host "  $pkgName publie avec succes" -ForegroundColor Green
        $publishedCount++
    } else {
        Write-Host "  Echec de publication de $pkgName (code: $exitCode)" -ForegroundColor Red
        $failedCount++
    }

    Pop-Location
    Write-Host ""
}

# Final summary
Write-Host ""
Write-Host "================================================" -ForegroundColor Blue

if ($failedCount -eq 0) {
    Write-Host "Tous les packages ont ete publies avec succes !" -ForegroundColor Green
    Write-Host "================================================" -ForegroundColor Blue
    Write-Host ""

    # Get the version to use for git tag
    $tagVersion = ""
    if ($customVersion) {
        $tagVersion = $customVersion
    } elseif ($newVersions["eva-css-fluid"]) {
        $tagVersion = $newVersions["eva-css-fluid"]
    } else {
        $tagVersion = $currentVersions["eva-css-fluid"]
    }

    Write-Host "Prochaines etapes recommandees:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  1. Commit des changements:" -ForegroundColor White
    Write-Host "     git add packages\*\package.json" -ForegroundColor Gray
    Write-Host "     git commit -m `"chore: bump versions to $tagVersion`"" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  2. Creer un tag git:" -ForegroundColor White
    Write-Host "     git tag v$tagVersion" -ForegroundColor Gray
    Write-Host "     git push origin main --tags" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  3. Verifier sur NPM:" -ForegroundColor White
    Write-Host "     - https://www.npmjs.com/package/eva-colors"
    Write-Host "     - https://www.npmjs.com/package/eva-css-fluid"
    Write-Host "     - https://www.npmjs.com/package/eva-css-purge"
    Write-Host "     - https://www.npmjs.com/package/create-eva-css"
    Write-Host ""
} else {
    Write-Host "Publication partielle" -ForegroundColor Yellow
    Write-Host "================================================" -ForegroundColor Blue
    Write-Host ""
    Write-Host "  Reussis: $publishedCount" -ForegroundColor Green
    Write-Host "  Echecs: $failedCount" -ForegroundColor Red
    Write-Host ""
    Write-Host "Veuillez verifier les erreurs ci-dessus." -ForegroundColor Yellow
    Write-Host ""
}
