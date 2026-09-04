from typing import Any, Dict

def compile_user_context(config: Dict[str, Any]) -> str:
    """Only expose model-relevant settings; security policy is enforced separately."""
    lines = []

    if config.get("language"):
        lines.append(f"Respond in language: {config['language']}")
    if config.get("tone"):
        lines.append(f"Tone profile: {config['tone']}")
    if config.get("reasoning"):
        lines.append(f"Reasoning level: {config['reasoning']}")
    if config.get("autonomy"):
        lines.append(f"Autonomy profile: {config['autonomy']}")
    if config.get("project_only"):
        lines.append("Use project-scoped context only.")
    if config.get("web") is False:
        lines.append("Do not use web tools for this task.")
    if config.get("python") is False:
        lines.append("Do not use Python tools for this task.")

    return "\n".join(lines)