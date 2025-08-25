import os
from jinja2 import Environment, FileSystemLoader


class ReadmeGenerator:
    """
    Gathers the assets processed with the tags and description generated.
    Renders README with assets inf for viz.
    """
    def __init__(self):
        self.assets = []
    
    def add_asset(self, asset, thumbnail, tags, description):
        asset_objet = {
            "asset": asset,
            "thumbnail": str(thumbnail).split('asset-packs/')[1],
            "tags": tags,
            "description": description,
        }
        self.assets.append(asset_objet)
    
    def renderize_readme(self):

        BASE_DIR = os.path.dirname(os.path.abspath(__file__))

        TEMPLATE_DIR = os.path.join(BASE_DIR, "templates")

        env = Environment(loader=FileSystemLoader(TEMPLATE_DIR))
        template = env.get_template("README.template.md")

        output = template.render(assets=self.assets)

        with open("test-output.md", "w", encoding="utf-8") as f:
            f.write(output)

        print("Test report renderized successfully.")

        pass


