<#
  deploy-iis.ps1 — nasazení statického webu ReceptionAI na IIS (Windows).

  Co dělá (idempotentně — lze spouštět opakovaně):
    1. Sám se povýší na Administrátora (UAC) a přepne do Windows PowerShlevel 5.1,
       kde funguje modul WebAdministration.
    2. Pokud chybí dist\, spustí `npm run build`.
    3. Vytvoří dedikovaný app pool (No Managed Code — web je statický).
    4. Vytvoří web "recepceai-web" s fyzickou cestou do dist\.
    5. Přidá HTTP bindingy (port 80) pro recepceai.cz i www.recepceai.cz.
    6. Najde v úložišti certifikát pro daný hostname a přidá HTTPS bindingy
       (port 443, SNI) — sdílí port 443 s ostatními weby.

  STÁVAJÍCÍCH WEBŮ (admin., kiosk., …) SE NEDOTÝKÁ — jen přidává nový web.

  Spuštění: klikni pravým → "Spustit pomocí PowerShellu", nebo:
      powershell -ExecutionPolicy Bypass -File .\deploy-iis.ps1
#>

[CmdletBinding()]
param(
  [string]   $SiteName = 'recepceai-web',
  [string[]] $Hosts    = @('recepceai.cz', 'www.recepceai.cz'),
  [switch]   $Build,        # vynutit build i když dist\ existuje
  [switch]   $SkipHttps     # přeskočit HTTPS bindingy
)

$ErrorActionPreference = 'Stop'
$root      = $PSScriptRoot
$distPath  = Join-Path $root 'dist'

# --- Logování (Out-File do pevné cesty v repu) ------------------------------
$logFile = Join-Path $root 'deploy-iis.log'
"[$(Get-Date -Format HH:mm:ss)] BOOT root=$root" | Out-File -FilePath $logFile -Encoding utf8
function Log {
  param([string]$m, [string]$c = 'Gray')
  $line = "[{0}] {1}" -f (Get-Date).ToString('HH:mm:ss'), $m
  $line | Out-File -FilePath $logFile -Append -Encoding utf8
  Write-Host $line -ForegroundColor $c
}
trap {
  Log "TRAP: $($_.Exception.Message)" 'Red'
  Log ("STACK: " + $_.ScriptStackTrace) 'DarkRed'
  exit 1
}

# --- 1. Povýšení na admin + Windows PowerShell 5.1 ---------------------------
$isCore  = $PSVersionTable.PSEdition -eq 'Core'
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()
            ).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
Log "start PSEdition=$($PSVersionTable.PSEdition) isAdmin=$isAdmin root=$root"

if ($isCore -or -not $isAdmin) {
  Log "relaunch elevated (isCore=$isCore isAdmin=$isAdmin)" 'Yellow'
  $winPS = "$env:windir\System32\WindowsPowerShell\v1.0\powershell.exe"
  $argList = @('-NoProfile','-ExecutionPolicy','Bypass','-File',"`"$PSCommandPath`"")
  if ($Build)     { $argList += '-Build' }
  if ($SkipHttps) { $argList += '-SkipHttps' }
  Start-Process -FilePath $winPS -Verb RunAs -ArgumentList $argList
  return
}

Log "importuji WebAdministration..."
Import-Module WebAdministration
Log "WebAdministration OK"

Write-Host "`n=== Nasazení $SiteName na IIS ===" -ForegroundColor Cyan

# --- 2. Build (pokud chybí dist\) --------------------------------------------
if ($Build -or -not (Test-Path (Join-Path $distPath 'index.html'))) {
  Write-Host "`n[build] Spouštím npm run build..." -ForegroundColor Cyan
  Push-Location $root
  try {
    if (-not (Test-Path (Join-Path $root 'node_modules'))) { & npm install }
    & npm run build
    if ($LASTEXITCODE -ne 0) { throw "npm run build selhal (exit $LASTEXITCODE)" }
  } finally { Pop-Location }
}
if (-not (Test-Path (Join-Path $distPath 'index.html'))) {
  throw "Nenalezeno $distPath\index.html — build neproběhl správně."
}

# --- 3. App pool (No Managed Code) -------------------------------------------
$poolPath = "IIS:\AppPools\$SiteName"
if (-not (Test-Path $poolPath)) {
  Write-Host "`n[pool] Vytvářím app pool '$SiteName'..." -ForegroundColor Cyan
  New-WebAppPool -Name $SiteName | Out-Null
}
Set-ItemProperty $poolPath -Name managedRuntimeVersion -Value ''        # No Managed Code
Set-ItemProperty $poolPath -Name startMode             -Value 'AlwaysRunning'

# --- 4. Web ------------------------------------------------------------------
$firstHost = $Hosts[0]
if (-not (Get-Website -Name $SiteName -ErrorAction SilentlyContinue)) {
  Write-Host "[web]  Vytvářím web '$SiteName' → $distPath" -ForegroundColor Cyan
  New-Website -Name $SiteName -PhysicalPath $distPath -ApplicationPool $SiteName `
              -HostHeader $firstHost -Port 80 | Out-Null
} else {
  Write-Host "[web]  Web '$SiteName' už existuje — aktualizuji cestu a pool." -ForegroundColor DarkGray
  Set-ItemProperty "IIS:\Sites\$SiteName" -Name physicalPath    -Value $distPath
  Set-ItemProperty "IIS:\Sites\$SiteName" -Name applicationPool -Value $SiteName
}

# --- 5. HTTP bindingy --------------------------------------------------------
foreach ($h in $Hosts) {
  $exists = Get-WebBinding -Name $SiteName -Protocol http -Port 80 -HostHeader $h -ErrorAction SilentlyContinue
  if (-not $exists) {
    Write-Host "[http] + http://$h" -ForegroundColor Green
    New-WebBinding -Name $SiteName -Protocol http -Port 80 -HostHeader $h
  } else {
    Write-Host "[http] = http://$h (už existuje)" -ForegroundColor DarkGray
  }
}

# --- 5b. Anonymní přístup + čtecí práva --------------------------------------
# Veřejný statický web → Anonymous auth ON, Windows/Basic OFF (jinak IIS vrací 401).
Set-WebConfigurationProperty -PSPath 'IIS:\' -Location $SiteName `
  -Filter '/system.webServer/security/authentication/anonymousAuthentication' -Name enabled -Value $true
foreach ($f in 'windowsAuthentication','basicAuthentication','digestAuthentication') {
  try {
    Set-WebConfigurationProperty -PSPath 'IIS:\' -Location $SiteName `
      -Filter "/system.webServer/security/authentication/$f" -Name enabled -Value $false
  } catch { Log "  ($f nelze nastavit — modul možná není instalován)" 'DarkGray' }
}
Log "[auth] anonymous=ON, windows/basic=OFF"

# Čtecí práva pro IIS identity na fyzickou složku
foreach ($acct in 'IIS_IUSRS','IUSR') {
  & icacls $distPath /grant "${acct}:(OI)(CI)(RX)" /T /Q | Out-Null
}
Log "[acl]  čtecí práva pro IIS_IUSRS a IUSR na $distPath"

# --- 6. HTTPS bindingy + certifikát ------------------------------------------
function Test-CertMatchesHost {
  param($Cert, [string]$H)
  foreach ($dns in $Cert.DnsNameList.Unicode) {
    if ($dns -eq $H) { return $true }
    if ($dns -like '`**') {                                   # wildcard *.domena
      $suffix = $dns.Substring(1)                             # ".domena"
      if ($H.EndsWith($suffix) -and ($H.Split('.').Count -eq $dns.Split('.').Count)) { return $true }
    }
  }
  return $false
}

if (-not $SkipHttps) {
  foreach ($h in $Hosts) {
    $cert = Get-ChildItem Cert:\LocalMachine\My |
            Where-Object { Test-CertMatchesHost $_ $h } |
            Sort-Object NotAfter -Descending | Select-Object -First 1

    if (-not $cert) {
      Write-Host "[https]! Pro '$h' nenalezen certifikát v LocalMachine\My — HTTPS přeskočeno." -ForegroundColor Yellow
      continue
    }

    $b = Get-WebBinding -Name $SiteName -Protocol https -Port 443 -HostHeader $h -ErrorAction SilentlyContinue
    if (-not $b) {
      Write-Host "[https]+ https://$h  (cert: $($cert.Subject), platí do $($cert.NotAfter.ToString('yyyy-MM-dd')))" -ForegroundColor Green
      New-WebBinding -Name $SiteName -Protocol https -Port 443 -HostHeader $h -SslFlags 1   # SNI
      $b = Get-WebBinding -Name $SiteName -Protocol https -Port 443 -HostHeader $h
    } else {
      Write-Host "[https]= https://$h (binding existuje, přepínám certifikát)" -ForegroundColor DarkGray
    }
    # přiřazení certifikátu k SNI bindingu
    $b.AddSslCertificate($cert.Thumbprint, 'My')
  }
}

# --- Hotovo ------------------------------------------------------------------
Start-Website -Name $SiteName -ErrorAction SilentlyContinue | Out-Null
Write-Host "`n=== HOTOVO ===" -ForegroundColor Cyan
Get-WebBinding -Name $SiteName | Select-Object protocol, bindingInformation | Format-Table -AutoSize | Out-String | Write-Host
Write-Host "Web '$SiteName' běží. Otevři: https://$firstHost`n" -ForegroundColor Green
Log "DONE ok"
