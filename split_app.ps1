$lines = [System.IO.File]::ReadAllLines('d:\Team Projects\js\app.js', [System.Text.Encoding]::UTF8)
Write-Host "Total lines: $($lines.Count)"

# Split at line 6982 (index 6981) - computeCostSheet starts here
$part1 = $lines[0..6980]  # lines 1-6981
$part2 = $lines[6981..($lines.Count-1)]  # lines 6982-end

$part1Content = $part1 -join "`n"
$part2Content = $part2 -join "`n"

Write-Host "Part1 size: $($part1Content.Length)"
Write-Host "Part2 size: $($part2Content.Length)"
Write-Host "Part2 first line: $($part2[0])"
Write-Host "Part2 last line: $($part2[-1])"

[System.IO.File]::WriteAllText('d:\Team Projects\js\app1.js', $part1Content, [System.Text.Encoding]::UTF8)
Write-Host "app1.js written"

[System.IO.File]::WriteAllText('d:\Team Projects\js\app2.js', $part2Content, [System.Text.Encoding]::UTF8)
Write-Host "app2.js written"
