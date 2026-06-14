---
name: OpenRouter model slug deprecation
description: OpenRouter removed all `:free` suffix models. The code must use paid slugs without `:free`.
---

## Rule

OpenRouter free-tier models with the `:free` suffix (e.g. `meta-llama/llama-3.1-8b-instruct:free`) are no longer available and return HTTP 404. Always use the paid model slug without `:free` (e.g. `meta-llama/llama-3.1-8b-instruct`).

**Why:** OpenRouter retired their free tier for these models. The paid version works with the same API key and costs a fraction of a cent per request.

**How to apply:** When configuring OpenRouter provider model defaults, never append `:free`. Also include the required `HTTP-Referer` and `X-Title` headers in all OpenRouter requests so the provider can route credits properly.
