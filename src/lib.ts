import { RepositoryData, GitHubRepository } from "./types";
import { parse, HTMLElement } from "node-html-parser";
import { env } from "cloudflare:workers";

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
 * Fetch repository data from GitHub for a given username and parse pinned repositories
 */
async function fetchRepositoryData(
  username: string,
  repo: string,
): Promise<GitHubRepository> {
  const response = await fetch(
    `https://api.github.com/repos/${username}/${repo}`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        // @ts-ignore-next-line
        "User-Agent": env.gh_username + "/" + env.app_name,
      },
    },
  );

  const repository: GitHubRepository = await response.json();
  return repository;
}

/**
 * Fetch and parse pinned repositories for a given GitHub username
 *
 * @param username - GitHub username
 * @param getRepo - Whether to fetch repository data
 * @returns Array of pinned repositories
 * @throws Error if user not found or other network issues
 */
export async function getPinnedRepos(
  username: string,
  getRepo: boolean,
): Promise<any> {
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
      .map(async (el) => {
        const repoInfo = parseRepository(root, el);
        const { author, name } = repoInfo;
        const data = getRepo
          ? await fetchRepositoryData(author, name)
          : undefined;

        return { ...repoInfo, data };
      });

    return Promise.all(pinned_repos);
  } catch {
    throw new Error("Error parsing user");
  }
}
