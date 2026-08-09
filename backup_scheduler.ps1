# Automated Backup Scheduler Daemon for AERON MEDICAL
# Schedules daily backups: 1x Midnight (00:00), 1x Random daytime (09:00 - 18:00)

$scriptPath = Join-Path $PSScriptRoot "db_backup.ps1"

Write-Host "====================================================" -ForegroundColor Green
Write-Host "  🚀 AERON MEDICAL Automated Backup Scheduler Started" -ForegroundColor Green
Write-Host "  ⏰ Schedule: Midnight (00:00) + Random Daytime (09:00-18:00)" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Green

# Determine next random daytime backup time for today
function Get-RandomDaytimeTime {
    $now = Get-Date
    $randomHour = Get-Random -Minimum 9 -Maximum 18
    $randomMinute = Get-Random -Minimum 0 -Maximum 59
    $target = Get-Date -Hour $randomHour -Minute $randomMinute -Second 0
    if ($target -lt $now) {
        $target = $target.AddDays(1)
    }
    return $target
}

$nextRandomTime = Get-RandomDaytimeTime
Write-Host "Next random backup scheduled at: $nextRandomTime" -ForegroundColor Yellow

while ($true) {
    $now = Get-Date

    # 1. Midnight Check (00:00 - 00:01)
    if ($now.Hour -eq 0 -and $now.Minute -eq 0) {
        Write-Host "Running Midnight Backup..." -ForegroundColor Cyan
        powershell -ExecutionPolicy Bypass -File $scriptPath -Type midnight
        Start-Sleep -Seconds 65 # Sleep past midnight minute
        $nextRandomTime = Get-RandomDaytimeTime # Schedule next random time for new day
        Write-Host "New random backup scheduled for today at: $nextRandomTime" -ForegroundColor Yellow
    }

    # 2. Random Daytime Check
    if ($now -ge $nextRandomTime -and $now -lt $nextRandomTime.AddMinutes(2)) {
        Write-Host "Running Random Daytime Backup..." -ForegroundColor Cyan
        powershell -ExecutionPolicy Bypass -File $scriptPath -Type random
        Start-Sleep -Seconds 130 # Avoid duplicate execution
        $nextRandomTime = Get-RandomDaytimeTime
        Write-Host "Next random backup scheduled at: $nextRandomTime" -ForegroundColor Yellow
    }

    Start-Sleep -Seconds 30
}
