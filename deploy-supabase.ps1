# Envia o banco (migrations) e as Edge Functions para o Supabase novo.
# Uso (PowerShell, na pasta do projeto):  .\deploy-supabase.ps1
# Requisitos: Node.js instalado. Senha e token são pedidos na hora e não ficam salvos em arquivo.
$ErrorActionPreference = "Stop"
$ProjectRef = "przfzmvzmuqwjostxaqm"
Set-Location $PSScriptRoot

Write-Host "== Supabase: projeto $ProjectRef ==" -ForegroundColor Cyan
$tok = Read-Host "Access token (sbp_...)" -AsSecureString
$env:SUPABASE_ACCESS_TOKEN = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($tok))
$pw = Read-Host "Senha do banco do projeto novo" -AsSecureString
$env:SUPABASE_DB_PASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($pw))

function Run($desc, [scriptblock]$cmd) {
  Write-Host "`n>> $desc" -ForegroundColor Yellow
  & $cmd
  if ($LASTEXITCODE -ne 0) { throw "Falhou: $desc" }
}

try {
  Run "Vinculando ao projeto" { npx -y supabase@latest link --project-ref $ProjectRef }
  Run "Aplicando migrations (schema, RLS, funções, buckets)" { npx -y supabase@latest db push --include-all }
  Run "Publicando as Edge Functions" { npx -y supabase@latest functions deploy --project-ref $ProjectRef --use-api }

  $appUrl  = Read-Host "APP_URL (endereço do app, ex.: https://treinamentos.panflight.com)"
  $appName = Read-Host "APP_NAME (nome exibido nos e-mails) [Enter = Plataforma de Treinamentos]"
  if (-not $appName) { $appName = "Plataforma de Treinamentos" }
  $from    = Read-Host "RESEND_FROM (remetente dos e-mails, ex.: Treinamentos <no-reply@panflight.com>) [Enter = pular]"
  $secrets = @("APP_URL=$appUrl", "APP_NAME=$appName")
  if ($from) { $secrets += "RESEND_FROM=$from" }
  Run "Configurando secrets das functions" { npx -y supabase@latest secrets set --project-ref $ProjectRef @secrets }

  Write-Host "`nConcluído." -ForegroundColor Green
}
finally {
  Remove-Item Env:SUPABASE_ACCESS_TOKEN, Env:SUPABASE_DB_PASSWORD -ErrorAction SilentlyContinue
}
