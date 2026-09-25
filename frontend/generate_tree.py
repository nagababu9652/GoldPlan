#!/usr/bin/env python3
"""Generate a clean tree-like structure of the frontend directory."""
import os
import sys

def generate_tree(path, prefix="", exclude_dirs=None):
    if exclude_dirs is None:
        exclude_dirs = {".next", "node_modules", ".git", "dist", "build"}
    
    entries = []
    try:
        for entry in sorted(os.listdir(path)):
            full_path = os.path.join(path, entry)
            if os.path.isdir(full_path) and entry not in exclude_dirs:
                entries.append(("dir", entry, full_path))
            elif not os.path.isdir(full_path):
                entries.append(("file", entry, full_path))
    except PermissionError:
        return
    
    for i, (entry_type, name, full_path) in enumerate(entries):
        is_last = (i == len(entries) - 1)
        connector = "└── " if is_last else "├── "
        if entry_type == "dir":
            sys.stdout.write(f"{prefix}{connector}{name}/\n")
            new_prefix = prefix + ("    " if is_last else "│   ")
            generate_tree(full_path, new_prefix)
        else:
            sys.stdout.write(f"{prefix}{connector}{name}\n")

if __name__ == "__main__":
    sys.stdout.write("frontend/\n")
    generate_tree(os.path.dirname(os.path.abspath(__file__)))
</arg_value></tool_call>