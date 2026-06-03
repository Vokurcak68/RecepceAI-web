# setup-mailer.ps1 - zprovozni mailovou sluzbu kontaktniho formulare.
#  1) povoli ARR reverzni proxy na urovni serveru,
#  2) zaregistruje a spusti Scheduled Task, ktery sluzbu spousti pri startu systemu.
# Spustit jako Administrator. Parametr -NodePath = absolutni cesta k node.exe.
param(
  [string] $NodePath = 'C:\Users\Public\nodejs\node.exe',
  [string] $TaskName = 'ReceptionAI Mailer'
)
$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$log  = Join-Path $root 'setup-mailer.log'
function L([string]$m) { $l = "[{0}] {1}" -f (Get-Date).ToString('HH:mm:ss'), $m; $l | Out-File -FilePath $log -Append -Encoding utf8; Write-Host $l }
"BOOT root=$root node=$NodePath" | Out-File -FilePath $log -Encoding utf8

Import-Module WebAdministration

# 1) Povolit ARR reverzni proxy (server-level)
try {
  Set-WebConfigurationProperty -PSPath 'MACHINE/WEBROOT/APPHOST' -Filter 'system.webServer/proxy' -Name 'enabled' -Value 'True'
  L 'ARR proxy enabled = True'
} catch { L "ARR proxy ERR: $($_.Exception.Message)" }

# 2) Scheduled Task pro spousteni sluzby pri startu (a hned ted)
$action    = New-ScheduledTaskAction -Execute $NodePath -Argument 'server\mailer.mjs' -WorkingDirectory $root
$trigger   = New-ScheduledTaskTrigger -AtStartup
$principal = New-ScheduledTaskPrincipal -UserId 'S-1-5-18' -LogonType ServiceAccount -RunLevel Highest  # LocalSystem
$settings  = New-ScheduledTaskSettingsSet -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 1)
Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Principal $principal -Settings $settings -Force | Out-Null
L "scheduled task '$TaskName' registered"

Start-ScheduledTask -TaskName $TaskName
Start-Sleep -Seconds 3
$info = Get-ScheduledTask -TaskName $TaskName | Get-ScheduledTaskInfo
L "task state=$((Get-ScheduledTask -TaskName $TaskName).State) lastResult=$($info.LastTaskResult)"

# 3) overit, ze sluzba bezi (health)
try {
  $h = Invoke-WebRequest -Uri 'http://127.0.0.1:8090/health' -UseBasicParsing -TimeoutSec 8
  L "health = $($h.StatusCode) $($h.Content)"
} catch { L "health ERR: $($_.Exception.Message)" }
