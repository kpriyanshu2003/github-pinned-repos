import { components } from "@octokit/openapi-types";

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

export type GitHubRepository = components["schemas"]["full-repository"];
