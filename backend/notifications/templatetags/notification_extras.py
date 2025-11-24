from django import template

register = template.Library()


@register.filter
def cents_to_dollars(value) -> str:
    try:
        return f"{float(value) / 100:.2f}"
    except (TypeError, ValueError):
        return "0.00"
