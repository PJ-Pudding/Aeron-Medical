# ==============================================================================
# SCRIPT: audit_codebase.ps1
# Automated Code Quality, Spaghetti Architecture & Regression Risk Scanner
# ==============================================================================

param (
    [string]$TargetDir = "."
)

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "🔍 [CODE-AUDIT] Running Automated Codebase Architecture Scanner" -ForegroundColor Cyan
Write-Host "Target Directory: $TargetDir" -ForegroundColor Gray
Write-Host "================================================================" -ForegroundColor Cyan

$jsFiles = Get-ChildItem -Path $TargetDir -Recurse -Include *.js, *.jsx, *.ts, *.tsx | Where-Object {
    $_.FullName -notmatch "node_modules" -and
    $_.FullName -notmatch "backups" -and
    $_.FullName -notmatch "\.git" -and
    $_.FullName -notmatch "app\.compiled\.js" -and
    $_.FullName -notmatch "app\.js$"
}

$totalFiles = $jsFiles.Count
$totalLines = 0
$largeFiles = @()
$missingCleanup = @()
$unsafeAccess = @()
$globalWindowUsages = @()

foreach ($file in $jsFiles) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
    if (-not $content) { continue }

    $lines = ($content -split "`r?`n").Count
    $totalLines += $lines
    $relPath = $file.FullName.Replace((Get-Location).Path, "").TrimStart("\", "/")

    # 1. Monolithic Component Check (> 600 lines)
    if ($lines -gt 600) {
        $largeFiles += [PSCustomObject]@{
            Path  = $relPath
            Lines = $lines
        }
    }

    # 2. Memory Leak Check: EventListener / Interval without cleanup
    if ($content.Contains("addEventListener") -and -not $content.Contains("removeEventListener")) {
        $missingCleanup += [PSCustomObject]@{
            Path   = $relPath
            Reason = "addEventListener without removeEventListener"
        }
    }
    if ($content.Contains("setInterval") -and -not $content.Contains("clearInterval")) {
        $missingCleanup += [PSCustomObject]@{
            Path   = $relPath
            Reason = "setInterval without clearInterval"
        }
    }

    # 3. Global Window References
    $matches = [regex]::Matches($content, 'window\.[A-Za-z0-9_]+')
    foreach ($m in $matches) {
        $globalWindowUsages += $m.Value
    }
}

$uniqueGlobals = $globalWindowUsages | Select-Object -Unique

Write-Host "`n📊 1. Codebase Scale & Overview:" -ForegroundColor Yellow
Write-Host "   - Total Source Files : $totalFiles files"
Write-Host "   - Total Lines of Code: $totalLines lines"

Write-Host "`n🚨 2. Monolithic & God Components (> 600 lines):" -ForegroundColor Yellow
if ($largeFiles.Count -eq 0) {
    Write-Host "   ✅ No oversized monolithic components detected." -ForegroundColor Green
} else {
    foreach ($item in $largeFiles) {
        Write-Host "   ⚠️ $($item.Path) ($($item.Lines) lines)" -ForegroundColor Red
    }
}

Write-Host "`n🛡️ 3. Memory Leaks & Missing Lifecycle Cleanups:" -ForegroundColor Yellow
if ($missingCleanup.Count -eq 0) {
    Write-Host "   ✅ All listeners and timers have proper cleanups." -ForegroundColor Green
} else {
    foreach ($item in $missingCleanup) {
        Write-Host "   ⚠️ $($item.Path) -> $($item.Reason)" -ForegroundColor Yellow
    }
}

Write-Host "`n🌐 4. Global State & window.* Coupling Points ($($uniqueGlobals.Count) unique variables):" -ForegroundColor Yellow
$uniqueGlobals | Select-Object -First 10 | ForEach-Object {
    Write-Host "   - $_" -ForegroundColor Gray
}
if ($uniqueGlobals.Count -gt 10) {
    Write-Host "   ... and $($uniqueGlobals.Count - 10) more global references" -ForegroundColor Gray
}

# Health Score Estimation
$penalty = ($largeFiles.Count * 5) + ($missingCleanup.Count * 10)
$healthScore = [Math]::Max(10, [Math]::Min(100, (100 - $penalty)))

Write-Host "`n================================================================" -ForegroundColor Cyan
Write-Host "🏆 Overall Architecture Health Score: $healthScore / 100" -ForegroundColor $(if ($healthScore -ge 80) { "Green" } elseif ($healthScore -ge 50) { "Yellow" } else { "Red" })
Write-Host "================================================================" -ForegroundColor Cyan
