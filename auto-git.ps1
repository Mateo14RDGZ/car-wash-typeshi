# Script PowerShell para subir cambios automáticamente a git
# Monitorea todos los archivos del proyecto y sube los cambios al detectar modificaciones

$path = "."
$filter = "*.*"
$lastChange = Get-Date

Write-Host "[auto-git] Observando cambios en $path ..."

$fsw = New-Object IO.FileSystemWatcher $path, $filter -Property @{ 
    IncludeSubdirectories = $true
    EnableRaisingEvents = $true
}

Register-ObjectEvent $fsw Changed -SourceIdentifier FileChanged -Action {
    $global:lastChange = Get-Date
}
Register-ObjectEvent $fsw Created -SourceIdentifier FileCreated -Action {
    $global:lastChange = Get-Date
}
Register-ObjectEvent $fsw Deleted -SourceIdentifier FileDeleted -Action {
    $global:lastChange = Get-Date
}
Register-ObjectEvent $fsw Renamed -SourceIdentifier FileRenamed -Action {
    $global:lastChange = Get-Date
}

while ($true) {
    Start-Sleep -Seconds 2
    if ((Get-Date) - $lastChange -gt (New-TimeSpan -Seconds 2)) {
        continue
    }
    Write-Host "[auto-git] Cambios detectados. Subiendo al repositorio..."
    git add .
    $msg = "auto: cambios detectados el $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    git commit -m $msg
    git push
    $lastChange = Get-Date
    Write-Host "[auto-git] Cambios subidos. Observando..."
    Start-Sleep -Seconds 5
}
