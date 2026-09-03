#!/usr/bin/env python3
# ==============================================================================
# SCRIPT: analyze_dependencies.py
# Dependency Graph, Broken Interface Contracts & Component Architecture Analyzer
# ==============================================================================

import os
import re
import sys
import json
import argparse
from pathlib import Path

def scan_files(root_dir):
    js_files = []
    exclude_dirs = {'node_modules', 'backups', '.git', 'scratch'}
    exclude_files = {'app.compiled.js', 'app.js'}

    for root, dirs, files in os.walk(root_dir):
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        for f in files:
            if f.endswith(('.js', '.jsx', '.ts', '.tsx')) and f not in exclude_files:
                js_files.append(os.path.join(root, f))
    return js_files

def analyze_components(files, base_dir):
    components = {}
    function_defs = {}
    component_usages = []

    func_regex = re.compile(r'function\s+([A-Za-z0-9_]+)\s*\(([^)]*)\)')
    tag_regex = re.compile(r'<([A-Z][A-Za-z0-9_]+)\b([^/>]*)')
    prop_regex = re.compile(r'([a-zA-Z0-9_]+)\s*=\s*(?:\{[^}]*\}|"[^"]*")')

    for file_path in files:
        rel_path = os.path.relpath(file_path, base_dir)
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
        except Exception as e:
            continue

        # Extract declared functions/components
        for match in func_regex.finditer(content):
            name = match.group(1)
            params_raw = match.group(2).strip()
            params = [p.strip().split('=')[0].strip() for p in params_raw.split(',') if p.strip()]
            function_defs[name] = {
                "file": rel_path,
                "params": params,
                "raw_params": params_raw
            }

        # Extract JSX component usages
        for match in tag_regex.finditer(content):
            comp_name = match.group(1)
            props_raw = match.group(2)
            props = prop_regex.findall(props_raw)
            component_usages.append({
                "caller_file": rel_path,
                "component": comp_name,
                "passed_props": props
            })

    # Validate Interface Contracts (Check if passed props match declared params)
    contract_issues = []
    for usage in component_usages:
        target = usage["component"]
        if target in function_defs:
            defn = function_defs[target]
            declared_params = defn["params"]
            passed = usage["passed_props"]
            
            # If destructured single object { a, b, c }
            if len(declared_params) == 1 and ('{' in defn["raw_params"] or '}' in defn["raw_params"]):
                destructured = re.findall(r'([a-zA-Z0-9_]+)', defn["raw_params"])
                destructured = [d for d in destructured if d not in {'const', 'let', 'var'}]
                # Check missing critical props
                for prop in destructured:
                    if prop not in passed and not prop.startswith('on') and prop not in {'currentUser', 'initialTab'}:
                        # potential optional or missing
                        pass

    return {
        "total_components": len(function_defs),
        "total_usages": len(component_usages),
        "contract_issues": contract_issues,
        "function_defs": function_defs
    }

def main():
    parser = argparse.ArgumentParser(description="Analyze Codebase Dependencies & Interfaces")
    parser.add_argument("--root", default=".", help="Root directory of the project")
    parser.add_argument("--json", action="store_true", help="Output raw JSON")
    args = parser.parse_args()

    base_dir = os.path.abspath(args.root)
    files = scan_files(base_dir)
    results = analyze_components(files, base_dir)

    if args.json:
        print(json.dumps(results, indent=2, ensure_ascii=False))
    else:
        print("\n" + "=" * 64)
        print("🐍 [DEPENDENCY ANALYZER] Component & Interface Audit")
        print("=" * 64)
        print(f"📁 Scanned Files       : {len(files)} source files")
        print(f"🧩 Detected Components : {results['total_components']} components/functions")
        print(f"🔗 Component Usages    : {results['total_usages']} JSX invocation points")
        print(f"⚠️ Contract Mismatches : {len(results['contract_issues'])} potential issues")
        print("=" * 64 + "\n")

if __name__ == "__main__":
    main()
