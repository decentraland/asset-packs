# Auto Tag Assets

Tests using OLLAMA and LLAVA for asset tagging and desription generation.

---

## Tests

---

{% for asset in assets %}

**Asset**: {{ asset.asset }}

![Thumbnail]({{ asset.thumbnail }})   

**Tags**: {{ asset.tags }}

**Description**: {{ asset.description }}

---

{% endfor %}