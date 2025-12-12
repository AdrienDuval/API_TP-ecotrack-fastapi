# PowerShell script to set up environment variables for EcoTrack API
# Run this script before running ingestion scripts or the API

# Set OpenAQ API Key
$env:OPENAQ_API_KEY="ccbf10e08dd048d351db7ff346cd3bc551677269814edb1f1ff1862296226bde"

Write-Host "✅ Environment variables set!" -ForegroundColor Green
Write-Host ""
Write-Host "OPENAQ_API_KEY has been set for this PowerShell session." -ForegroundColor Yellow
Write-Host ""
Write-Host "To make this permanent, add to your PowerShell profile:" -ForegroundColor Cyan
Write-Host '  $env:OPENAQ_API_KEY="your_key_here"' -ForegroundColor Gray
Write-Host ""
Write-Host "Or create a .env file in the project root with:" -ForegroundColor Cyan
Write-Host "  OPENAQ_API_KEY=your_key_here" -ForegroundColor Gray
Write-Host ""

