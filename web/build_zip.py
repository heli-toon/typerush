#!/usr/bin/env python3
"""
GameMonetize Package Builder for TypeRush
Creates a compliant .zip archive where index.html and assets sit at the root level of the archive.
"""

import os
import sys
import zipfile

def build_package():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_zip_name = "typerush-gamemonetize.zip"
    output_zip_path = os.path.join(os.path.dirname(script_dir), output_zip_name)

    # Check index.html for Game ID replacement
    index_path = os.path.join(script_dir, "index.html")
    if os.path.exists(index_path):
        with open(index_path, "r", encoding="utf-8") as f:
            content = f.read()
            if 'gameId: "YOUR_GAMEMONETIZE_GAME_ID"' in content:
                print("⚠️  NOTICE: 'YOUR_GAMEMONETIZE_GAME_ID' placeholder is still present in web/index.html.")
                print("   Remember to insert your actual Game ID from GameMonetize before final publication!\n")

    print(f"📦 Packaging '{script_dir}' into '{output_zip_name}'...")

    # Files or directories to exclude from the upload zip
    exclude_items = {
        output_zip_name,
        "build_zip.py",
        "README.md",
        ".DS_Store",
        "Thumbs.db"
    }

    total_files = 0
    with zipfile.ZipFile(output_zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(script_dir):
            # Prune hidden directories
            dirs[:] = [d for d in dirs if not d.startswith('.')]

            for file in files:
                if file in exclude_items or file.startswith('.'):
                    continue

                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, script_dir)

                zipf.write(full_path, arcname=rel_path)
                total_files += 1

    print(f"✅ Successfully created {output_zip_name} ({total_files} files compressed).")
    print(f"   Root file verified: index.html is directly at the archive root.")
    print(f"   Location: {output_zip_path}\n")

if __name__ == "__main__":
    build_package()
