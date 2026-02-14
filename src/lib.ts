import { parse, HTMLElement } from "node-html-parser";

/**
 * Represents a GitHub repository with pinned status
 */
export interface RepositoryData {
  author: string;
  name: string;
  description: string;
  language: string;
  languageColor?: string;
  stars?: number;
  forks?: number;
}

/**
 * Parse a single repository element from GitHub HTML
 */
function parseRepository(root: HTMLElement, el: HTMLElement): RepositoryData {
  const repoPath =
    el.querySelector("a")?.getAttribute("href")?.split("/") || [];
  const [, author = "", name = ""] = repoPath;

  const parseMetric = (index: number): number => {
    try {
      return (
        Number(
          el
            .querySelectorAll("a.pinned-item-meta")
            [index]?.text?.replace(/\n/g, "")
            .trim(),
        ) || 0
      );
    } catch {
      return 0;
    }
  };

  const languageSpan = el.querySelector("span[itemprop='programmingLanguage']");
  const languageColorSpan = languageSpan?.parentNode?.querySelector(
    ".repo-language-color",
  );

  return {
    author,
    name,
    description:
      el.querySelector("p.pinned-item-desc")?.text?.replace(/\n/g, "").trim() ||
      "",
    language: languageSpan?.text || "",
    languageColor:
      languageColorSpan
        ?.getAttribute("style")
        ?.match(/background-color:\s*([^;]+)/)?.[1] || "",
    stars: parseMetric(0),
    forks: parseMetric(1),
  };
}

/**
 * Fetch and parse pinned repositories for a given GitHub username
 *
 * @param username - GitHub username
 * @returns Array of pinned repositories
 * @throws Error if user not found or other network issues
 */
export async function getPinnedRepos(
  username: string,
): Promise<RepositoryData[]> {
  const request = await fetch(`https://github.com/${username}`);

  if (request.status === 404) {
    throw new Error("User not found");
  }

  if (request.status === 429) {
    throw new Error("Origin rate limit exceeded");
  }

  if (request.status !== 200) {
    throw new Error("Error fetching user");
  }

  const html = await request.text();
  const root = parse(html);

  try {
    const pinned_repos = root
      .querySelectorAll(".js-pinned-item-list-item")
      .map((el) => parseRepository(root, el));

    return pinned_repos;
  } catch {
    throw new Error("Error parsing user");
  }
}
