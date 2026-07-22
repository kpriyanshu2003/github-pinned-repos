# 📌 Github Pinned Repos

Fetch GitHub pinned repositories for any user. Available as both an **npm package** and a **Cloudflare Workers API**.

This project scrapes the pinned repositories from a user's GitHub profile page and returns structured data about each repository, including the name, description, primary language, star count, and fork count.

## 📦 NPM Package

Install the package:

```bash
npm install @kpriyanshu2003/github-pinned-repos
```

### Usage

```javascript
import { getPinnedRepos } from "@kpriyanshu2003/github-pinned-repos";

const repos = await getPinnedRepos("kpriyanshu2003");
console.log(repos);
```

### Response Format

Basic Response:

```json
[
    {
        "author": "kpriyanshu2003",
        "name": "repo-name",
        "description": "🧰 Discover new developer tools",
        "language": "JavaScript",
        "languageColor": "#f1e05a",
        "stars": 0,
        "forks": 0
    },
    ...
]
```

Detailed Response (with getRepo):

```json
[
  {
    "author": "kpriyanshu2003",
    "name": "repo-name",
    "description": "🧰 Discover new developer tools",
    "language": "JavaScript",
    "languageColor": "#f1e05a",
    "stars": 0,
    "forks": 0,
    "data": "GitHub REST API, get repository"
  }
]
```

### Error Handling

```javascript
try {
  const repos = await getPinnedRepos("username");
} catch (error) {
  console.error(error.message); // "User not found" | "Origin rate limit exceeded" | "Error parsing user"
}
```

---

## 🚀 Cloudflare Workers API

Deploy the included Hono API to Cloudflare Workers for a REST endpoint.

### Query the API

```http
GET https://github-pinned.kpriyanshu.workers.dev/:username?getRepo&pretty
```

Replace `:username` with a GitHub username. Returns the same JSON format as the npm package.

Add `?getRepo` at the end to also fetch the repository information (takes slighly longer).

You can add `?pretty` at the end of your request to get a formatted response.

### Error Responses

If an error occurs, the API returns a non-200 status code with:

```json
{
  "detail": "Error message"
}
```

> [!NOTE]  
> The API has a 5-minute cache in place to reduce requests to GitHub. Pinned repository updates may take a moment to reflect.

---

## 🛠️ Development & Self-Hosting

### Setup

Clone the repository and install dependencies:

```bash
npm install
```

### Local Development

Run the Hono dev server:

```bash
npm run dev
```

### Deploy to Cloudflare Workers

Deploy your own instance:

```bash
npm run deploy
```

You'll need a Cloudflare account and be authenticated with `wrangler`.

---

## Credits

- [Paul Haedrich](https://github.com/berrysauce)
