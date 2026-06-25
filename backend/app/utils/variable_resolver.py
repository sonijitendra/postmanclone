"""Variable resolver utility for {{variable}} syntax replacement."""

import re
from typing import Dict


# Pattern to match {{variable_name}}
VARIABLE_PATTERN = re.compile(r"\{\{([^}]+)\}\}")


def resolve_variables(text: str, variables: Dict[str, str]) -> str:
    """Replace {{variable}} placeholders in text with their values.

    Args:
        text: The text containing {{variable}} placeholders.
        variables: A dict mapping variable names to their values.

    Returns:
        The text with all recognized variables replaced. Unrecognized
        variables are left as-is.
    """
    if not text or not variables:
        return text or ""

    def replacer(match: re.Match) -> str:
        var_name = match.group(1).strip()
        return variables.get(var_name, match.group(0))

    return VARIABLE_PATTERN.sub(replacer, text)


def resolve_key_value_list(
    items: list, variables: Dict[str, str]
) -> list:
    """Resolve variables in a list of key-value dicts.

    Each dict should have 'key', 'value', and 'enabled' fields.
    Only processes enabled items.
    """
    if not items:
        return []

    resolved = []
    for item in items:
        if not isinstance(item, dict):
            resolved.append(item)
            continue

        resolved_item = item.copy()
        if item.get("enabled", True):
            resolved_item["value"] = resolve_variables(
                str(item.get("value", "")), variables
            )
            resolved_item["key"] = resolve_variables(
                str(item.get("key", "")), variables
            )
        resolved.append(resolved_item)
    return resolved


def build_variable_dict(environment) -> Dict[str, str]:
    """Build a variable lookup dict from an Environment model.

    Only includes enabled variables.
    """
    if not environment or not environment.variables:
        return {}

    return {
        var.key: var.value
        for var in environment.variables
        if var.enabled
    }
