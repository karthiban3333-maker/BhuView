import re

with open("frontend/src/styles.css", "r") as f:
    css = f.read()

# Make ambient-background transparent/light in standard mode
css = css.replace(
    ".ambient-background{position:fixed;inset:0;z-index:0;overflow:hidden;pointer-events:none;isolation:isolate;background:radial-gradient(ellipse at 48% 20%,#0b3749 0%,#071b2b 48%,#050f1b 100%)",
    ".ambient-background{position:fixed;inset:0;z-index:0;overflow:hidden;pointer-events:none;isolation:isolate;background:transparent"
)

# Replace dark ambient gradient in standard mode
css = css.replace(
    ".standard-mode>.ambient-background{opacity:.18;filter:saturate(.45)}",
    ".standard-mode>.ambient-background{opacity:0;display:none}"
)

# Write updated CSS
with open("frontend/src/styles.css", "w") as f:
    f.write(css)

print("Updated ambient background in styles.css")
