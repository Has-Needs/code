#!/bin/bash
# Fix JSX Issues Script

echo "🔧 Fixing JSX syntax errors in App.tsx..."

# Create a backup
cp src/App.tsx src/App.tsx.backup

# Use Python to fix the file directly
python3 -c "
import re

# Read the file
with open('src/App.tsx', 'r') as f:
    content = f.read()

# Fix 1: Remove duplicate JSX expression
content = re.sub(r'{\s*{showCommunitiesModal && activePersona && \(\s*{\s*{showCommunitiesModal && activePersona && \(\s*', '{showCommunitiesModal && activePersona && (', content)

# Fix 2: Fix indentation (reduce excessive indentation)
content = re.sub(r'^(\s{10})', r'        ', content, flags=re.MULTILINE)

# Write back the fixed content
with open('src/App.tsx', 'w') as f:
    f.write(content)

print('✅ Fixed JSX syntax errors')
"

echo "✅ JSX fixes applied!"
echo "🔍 Running build to verify..."

# Try to build
npm run build
