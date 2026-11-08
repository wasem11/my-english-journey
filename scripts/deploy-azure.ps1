param([string]$AppName = 'myenglishjourney-family-1105', [string]$Region = 'westus3')
$ErrorActionPreference = 'Stop'
$mejRoot = Split-Path $PSScriptRoot -Parent
$env:AZURE_CONFIG_DIR = Join-Path $env:TEMP 'mej-azure-session'
$env:AZURE_CORE_COLLECT_TELEMETRY = '0'
$mejAz = Join-Path $env:TEMP 'mej-azure-cli/bin/az.cmd'
if (!(Test-Path -LiteralPath $mejAz)) { throw 'Install the official Azure CLI ZIP in the prepared temporary folder first.' }
function Invoke-MejAzure {
 param([Parameter(ValueFromRemainingArguments=$true)][string[]]$Arguments)
 & $mejAz @Arguments
 if ($LASTEXITCODE -ne 0) { throw 'Azure operation failed. No paid tier will be selected automatically.' }
}
Push-Location $mejRoot
try {
 Invoke-MejAzure account show --output none
 Invoke-MejAzure appservice plan create --resource-group myenglishjourney-rg --name myenglishjourney-phone-free --location $Region --is-linux --sku F1 --output none
 Invoke-MejAzure webapp create --resource-group myenglishjourney-rg --plan myenglishjourney-phone-free --name $AppName --runtime 'NODE:22-lts' --output none
 Invoke-MejAzure webapp update --resource-group myenglishjourney-rg --name $AppName --https-only true --output none
 $mejHostname = Invoke-MejAzure webapp show --resource-group myenglishjourney-rg --name $AppName --query defaultHostName --output tsv
 $env:MEJ_PUBLIC_ORIGIN = 'https://' + $mejHostname.Trim()
 # Keys are read from the private local environment and written to a private JSON settings file.
 node --env-file=server/.env scripts/prepare-hosting-settings.cjs
 if ($LASTEXITCODE -ne 0) { throw 'Could not prepare private hosting settings.' }
 Invoke-MejAzure webapp config appsettings set --resource-group myenglishjourney-rg --name $AppName --settings '@server/.hosting.env' --output none
 node scripts/package-hosting.cjs
 if ($LASTEXITCODE -ne 0) { throw 'Could not prepare deployment package.' }
 $mejZip = Join-Path $mejRoot 'output/myenglishjourney-deploy.zip'
 python scripts/zip-hosting.py
 if ($LASTEXITCODE -ne 0) { throw 'Could not create Linux-compatible ZIP.' }
 Invoke-MejAzure webapp deploy --resource-group myenglishjourney-rg --name $AppName --src-path $mejZip --type zip --enable-kudu-warmup false --output none
 Write-Output ('Deployed: ' + $env:MEJ_PUBLIC_ORIGIN)
} finally { Pop-Location }
