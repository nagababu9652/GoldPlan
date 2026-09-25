tree /F /A 'frontend' | Where-Object { $_ -notmatch '\.next' -and $_ -notmatch 'node_modules' } | Out-File -FilePath 'frontend\STRUCTURE.md' -Encoding utf8
