param(
    [string]$ProjectId
)

Write-Host "Starting functions + frontend build and deploy script"

# Build functions
Write-Host "Installing functions dependencies (legacy-peer-deps)..."
Push-Location "$(Split-Path -Path $PSScriptRoot -Parent)\functions"
npm install --legacy-peer-deps
Write-Host "Building functions (tsc)..."
npm run build
Pop-Location

# Build frontend
Write-Host "Building frontend (vite)..."
npm run build

# Deploy functions using firebase CLI (will prompt login if needed)
if ([string]::IsNullOrEmpty($ProjectId)) {
    Write-Host "Deploying functions (no project specified, using currently selected project in firebase)."
    npx firebase deploy --only functions
} else {
    Write-Host "Deploying functions to project: $ProjectId"
    npx firebase deploy --only functions --project $ProjectId
}

Write-Host "Deploy finished."

