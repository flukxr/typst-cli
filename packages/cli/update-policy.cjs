function isSelfUpdate(args) {
  return args[0] === "update" && !args.slice(1).some(arg => arg === "--help" || arg === "-h");
}

function selfUpdateMessage() {
  return [
    "Typst self-update is disabled in @flukxr/typst-cli.",
    "Updating the native executable directly would bypass npm and modify node_modules.",
    "",
    "Update a project dependency:",
    "  npm install --save-dev @flukxr/typst-cli@latest",
    "",
    "Update a global installation:",
    "  npm install --global @flukxr/typst-cli@latest"
  ].join("\n");
}

module.exports = { isSelfUpdate, selfUpdateMessage };
