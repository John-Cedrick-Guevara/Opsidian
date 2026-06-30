#!/usr/bin/env python3
"""
Automated converter for landing-page.html to React + Framer Motion
Run this script to automatically extract CSS and create React components
"""

import re
import os

# Read the source HTML
with open('../landing-page.html', 'r', encoding='utf-8') as f:
    html_content = f.read()

# Extract CSS
css_start = html_content.find('<style>') + 7
css_end = html_content.find('</style>')
css_content = html_content[css_start:css_end].strip()

# Save CSS
os.makedirs('src/assets', exist_ok=True)
with open('src/assets/landing.css', 'w', encoding='utf-8') as f:
    f.write(css_content)

print("✅ Extracted CSS to src/assets/landing.css")

# Extract component code (between script tags)
script_start = html_content.find('<script type="text/babel">') + 26
script_end = html_content.find('</script>', script_start)
js_content = html_content[script_start:script_end].strip()

# Save the raw JS for manual splitting
with open('components-raw.js', 'w', encoding='utf-8') as f:
    f.write(js_content)

print("✅ Extracted JS to components-raw.js")
print("\n📝 Next steps:")
print("1. Review components-raw.js")
print("2. Split into individual component files")
print("3. Add Framer Motion animations")
print("4. Import into App.jsx")
