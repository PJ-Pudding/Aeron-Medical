# Simple & Robust PowerShell HTTP Web Server for AERON MEDICAL
$port = 8085
$rootDir = $PSScriptRoot
if (-not $rootDir) { $rootDir = (Get-Location).Path }

# Auto-cleanup previous background server instances running server.ps1
$currentPid = $PID
Get-WmiObject Win32_Process -Filter "Name='powershell.exe'" -ErrorAction SilentlyContinue | ForEach-Object {
    if ($_.ProcessId -ne $currentPid -and $_.CommandLine -like "*server.ps1*") {
        Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
    }
}

# Auto-kill any non-system process listening on port 8085
Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue | ForEach-Object {
    if ($_.OwningProcess -ne 4) {
        Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
    }
}

Start-Sleep -Milliseconds 300

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")

try {
    $listener.Start()
    Write-Host "====================================================" -ForegroundColor Green
    Write-Host "  🚀 AERON MEDICAL Server is running successfully!" -ForegroundColor Green
    Write-Host "  🌐 Open in your browser: http://localhost:$port/" -ForegroundColor Cyan
    Write-Host "====================================================" -ForegroundColor Green

    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $relativePath = $request.Url.LocalPath.TrimStart('/')
        if ([string]::IsNullOrWhiteSpace($relativePath)) {
            $relativePath = "index.html"
        }

        # API Handler for Saving Database Tables to db/*.json
        if ($request.HttpMethod -eq "POST" -and $relativePath -eq "api/save-db") {
            try {
                $reader = New-Object System.IO.StreamReader($request.InputStream, $request.ContentEncoding)
                $jsonBody = $reader.ReadToEnd()
                $tableName = $request.QueryString["table"]

                if ($tableName -and $jsonBody) {
                    $targetPath = Join-Path $rootDir "db\$tableName.json"
                    [System.IO.File]::WriteAllText($targetPath, $jsonBody, [System.Text.Encoding]::UTF8)

                    $respObj = @{ success = $true; message = "Saved $tableName.json successfully"; path = "db/$tableName.json" }
                    $respJson = $respObj | ConvertTo-Json
                    $buffer = [System.Text.Encoding]::UTF8.GetBytes($respJson)
                    $response.ContentType = "application/json; charset=utf-8"
                    $response.ContentLength64 = $buffer.Length
                    $response.OutputStream.Write($buffer, 0, $buffer.Length)
                } else {
                    $response.StatusCode = 400
                }
            } catch {
                $response.StatusCode = 500
            }
            $response.Close()
            continue
        }

        $filePath = [System.IO.Path]::Combine($rootDir, $relativePath)

        if (Test-Path $filePath -PathType Leaf) {
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            
            switch ($ext) {
                ".html" { $response.ContentType = "text/html; charset=utf-8" }
                ".css"  { $response.ContentType = "text/css; charset=utf-8" }
                ".js"   { $response.ContentType = "application/javascript; charset=utf-8" }
                ".json" { $response.ContentType = "application/json; charset=utf-8" }
                ".png"  { $response.ContentType = "image/png" }
                ".jpg"  { $response.ContentType = "image/jpeg" }
                ".svg"  { $response.ContentType = "image/svg+xml" }
                default { $response.ContentType = "text/plain; charset=utf-8" }
            }

            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
            $buffer = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
            $response.ContentLength64 = $buffer.Length
            $response.OutputStream.Write($buffer, 0, $buffer.Length)
        }
        $response.Close()
    }
} catch {
    Write-Host "Error starting server: $_" -ForegroundColor Red
} finally {
    if ($listener -and $listener.IsListening) { 
        try { $listener.Stop() } catch {}
    }
    if ($listener) {
        try { $listener.Close() } catch {}
    }
}
