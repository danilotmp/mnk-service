# Script para liberar el puerto 3000 en Windows
# Uso: .\scripts\kill-port-3000.ps1

Write-Host "Buscando procesos en el puerto 3000..." -ForegroundColor Yellow

$port = 3000
$connections = netstat -ano | findstr ":$port"

if ($connections) {
    Write-Host "Procesos encontrados en el puerto $port:" -ForegroundColor Red
    $connections | ForEach-Object {
        $line = $_.ToString().Trim()
        if ($line -match "LISTENING\s+(\d+)") {
            $pid = $matches[1]
            Write-Host "  PID: $pid" -ForegroundColor Red
            try {
                Stop-Process -Id $pid -Force -ErrorAction Stop
                Write-Host "  ✓ Proceso $pid terminado exitosamente" -ForegroundColor Green
            } catch {
                Write-Host "  ✗ Error al terminar proceso $pid : $_" -ForegroundColor Red
            }
        }
    }
} else {
    Write-Host "✓ No hay procesos usando el puerto $port" -ForegroundColor Green
}

Write-Host "`nVerificando nuevamente..." -ForegroundColor Yellow
Start-Sleep -Seconds 1
$check = netstat -ano | findstr ":$port"
if (-not $check) {
    Write-Host "✓ Puerto $port liberado exitosamente" -ForegroundColor Green
} else {
    Write-Host "✗ El puerto $port aún está en uso" -ForegroundColor Red
}

