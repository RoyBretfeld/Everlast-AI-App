$source = "C:\Workflow\___111___Antigravity-Projekte\___EVERLAST-AI-TASK\___EVERLAST_AI_TASK"
$destination = "C:\Users\Bretfeld\Google Drive-Streaming\Meine Ablage\_Projekte-Programmierung\Antigravity\___EVERLAST_AI_TASK"

Write-Host "Syncing Everlast to Google Drive..." -ForegroundColor Cyan

# Robocopy for mirroring. /MIR mirrors, /XO excludes older files, /XD excludes directories
robocopy $source $destination /MIR /XD .git node_modules .next .rb_dumps _trash /FFT /Z /R:3 /W:5

Write-Host "Sync Complete!" -ForegroundColor Green
