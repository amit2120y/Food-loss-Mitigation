$ErrorActionPreference = 'Stop'
$shell = New-Object -ComObject Shell.Application
$rb = $shell.Namespace(0xA)
$found = @()
for ($i = 0; $i -lt $rb.Items().Count; $i++) {
    $it = $rb.Items().Item($i)
    $details = ""
    for ($j = 0; $j -lt 40; $j++) {
        $d = $rb.GetDetailsOf($it, $j)
        if ($d) { $details += $d + "||" }
    }
    if ($details -match "annasetu") {
        $found += [PSCustomObject]@{Index = $i; Name = $rb.GetDetailsOf($it, 0); OriginalLocation = $rb.GetDetailsOf($it, 1); Deleted = $rb.GetDetailsOf($it, 2); Details = $details }
    }
}
if ($found.Count -eq 0) {
    Write-Output "NO_MATCHES"
}
else {
    $found | Format-Table -AutoSize
    Write-Output "----END----"
}
