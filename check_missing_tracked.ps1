$ErrorActionPreference = 'Stop'
$repo = Split-Path -Parent $PSScriptRoot
$repo = $PSScriptRoot
Set-Location $repo
git ls-tree -r --name-only HEAD | Out-File tracked_files.txt -Encoding utf8
$missing = @()
Get-Content tracked_files.txt | ForEach-Object {
    $p = $_.Trim()
    if ($p -ne "" -and -not (Test-Path $p)) {
        $missing += $p
    }
}
if ($missing.Count -gt 0) {
    $missing | Sort-Object | ForEach-Object { Write-Output $_ }
}
else {
    Write-Output 'NO_MISSING_TRACKED_FILES'
}
