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
            "thumbnail": thumbnail,
            "tags": tags,
            "description": description,
        }
        self.assets.append(asset_objet)
    
    def renderize_readme(self):

        env = Environment(loader=FileSystemLoader("templataes"))
        template = env.get_template("README.template.md")

        output = template.render(self.assets)

        with open("test-output.md", "w", encoding="utf-8") as f:
            f.write(output)

        print("Test report renderized successfully.")

        pass


