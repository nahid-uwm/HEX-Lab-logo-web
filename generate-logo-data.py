#!/usr/bin/env python3

from pathlib import Path


ROOT = Path(__file__).resolve().parent
OUTPUT_FILE = ROOT / "logo-data.js"
VALID_SUFFIXES = {".png", ".svg"}
NAME_PREFIX = "hex lab logo"


def iter_logo_files() -> list[str]:
    paths = []

    for path in ROOT.rglob("*"):
        if not path.is_file():
            continue

        if path.suffix.lower() not in VALID_SUFFIXES:
            continue

        if not path.name.lower().startswith(NAME_PREFIX):
            continue

        relative_path = path.relative_to(ROOT).as_posix()
        paths.append(relative_path)

    return sorted(paths)


def build_manifest(paths: list[str]) -> str:
    lines = ["window.LOGO_FILES = Object.freeze(["]
    lines.extend(f'  "{path}",' for path in paths)
    lines.append("]);")
    lines.append("")
    return "\n".join(lines)


def main() -> None:
    logo_paths = iter_logo_files()
    OUTPUT_FILE.write_text(build_manifest(logo_paths), encoding="utf-8")
    print(f"Wrote {OUTPUT_FILE.name} with {len(logo_paths)} logo paths.")


if __name__ == "__main__":
    main()
