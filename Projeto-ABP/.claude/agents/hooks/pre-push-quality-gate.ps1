# Pre-push quality gate for TurboFlow
# Reads Bash tool input from stdin and blocks git push to trigger quality-auditor review

param()

try {
    $raw = [Console]::In.ReadToEnd()
    $tool = $raw | ConvertFrom-Json

    if ($tool.command -match 'git push') {
        Write-Host ""
        Write-Host "=========================================="
        Write-Host "  QUALITY GATE - Pre-push check"
        Write-Host "=========================================="
        Write-Host ""
        Write-Host "A git push was detected."
        Write-Host "Before pushing, invoke the quality-auditor agent to scan"
        Write-Host "for CRITICAL and HIGH issues in the codebase."
        Write-Host ""
        Write-Host "After reviewing the report and addressing any blockers,"
        Write-Host "retry the push."
        Write-Host ""
        exit 1
    }
} catch {
    # Not a git push or parse error — allow the tool call to proceed
    exit 0
}

exit 0
