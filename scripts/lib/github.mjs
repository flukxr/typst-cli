const API_ROOT = "https://api.github.com/repos/typst/typst";

export async function getRelease(requestedVersion = "latest") {
  const endpoint = requestedVersion === "latest"
    ? `${API_ROOT}/releases/latest`
    : `${API_ROOT}/releases/tags/v${requestedVersion}`;

  const response = await fetch(endpoint, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "flukxr-typst-cli-builder",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {})
    }
  });

  if (!response.ok) {
    throw new Error(`GitHub Releases API returned ${response.status} for ${endpoint}`);
  }

  const release = await response.json();
  const version = String(release.tag_name).replace(/^v/, "");
  return {
    version,
    tag: release.tag_name,
    htmlUrl: release.html_url,
    assets: release.assets.map(asset => ({
      name: asset.name,
      url: asset.browser_download_url,
      digest: asset.digest ?? null,
      size: asset.size
    }))
  };
}

export async function downloadText(url) {
  const response = await fetch(url, {
    headers: { "User-Agent": "flukxr-typst-cli-builder" }
  });
  if (!response.ok) throw new Error(`Download returned ${response.status} for ${url}`);
  return response.text();
}
