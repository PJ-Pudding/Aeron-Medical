# Automated Database Backup Script for AERON MEDICAL
# Backup Policy: Twice a day (1x Midnight at 00:00, 1x Random daytime between 09:00-18:00)

param (
    [string]$Type = "random" # "midnight" or "random"
)

$dbDir = "d:\Team Projects\db"
$backupBaseDir = "d:\Team Projects\db\backups"

if (-not (Test-Path $dbDir)) {
    Write-Host "Database directory $dbDir not found!" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $backupBaseDir)) {
    New-Item -ItemType Directory -Path $backupBaseDir -Force | Out-Null
}

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$folderName = "backup_${timestamp}_${Type}"
$targetBackupDir = Join-Path $backupBaseDir $folderName

New-Item -ItemType Directory -Path $targetBackupDir -Force | Out-Null

$jsonFiles = Get-ChildItem -Path $dbDir -Filter "*.json"
foreach ($file in $jsonFiles) {
    Copy-Item -Path $file.FullName -Destination $targetBackupDir -Force
}

# Also save a backup_log.json summary
$logEntry = @{
    timestamp = (Get-Date -Format "o")
    backupType = $Type
    folderName = $folderName
    filesBackedUp = $jsonFiles.Name
    status = "SUCCESS"
}

$logFile = Join-Path $backupBaseDir "backup_history.json"
$historyList = [System.Collections.Generic.List[object]]::new()
if (Test-Path $logFile) {
    try {
        $existing = Get-Content $logFile -Raw | ConvertFrom-Json
        foreach ($item in $existing) { $historyList.Add($item) }
    } catch {}
}
$historyList.Add($logEntry)
$historyList | ConvertTo-Json -Depth 5 | Set-Content -Path $logFile -Encoding UTF8

Write-Host "====================================================" -ForegroundColor Green
Write-Host "  Database Backup Completed Successfully!" -ForegroundColor Green
Write-Host "  Backup Location: $targetBackupDir" -ForegroundColor Cyan
Write-Host "  Type: $Type | Files: $($jsonFiles.Count)" -ForegroundColor Yellow
Write-Host "====================================================" -ForegroundColor Green
