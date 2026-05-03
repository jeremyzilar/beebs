# Beebs — Shopify theme

Liquid theme for **Beeb’s** (`https://beebsgoods.com/`). Treat this repo as production storefront code unless told otherwise.

---

## Critical settings

**Keep this block accurate** — it drives how assistants and you reason about navigation, content, and deploy targets. Update when menus, metaobjects, or environments change.

| Setting | Your value | Notes |
|--------|------------|--------|
| Production URL | `https://beebsgoods.com/` | Canonical storefront |
| Shopify admin store | _e.g. `your-store.myshopify.com`_ | Used with CLI / theme commands |
| Live theme name or ID | _fill in_ | Which theme is “live” in admin |
| Dev / preview theme | _fill in_ | Theme you attach `shopify theme dev` to |
| Footer column menus (handles) | Shop: `_handle_` · About: `_handle_` · Social: `_handle_` | **Online Store → Navigation** — must match **Footer menu column** blocks |
| Main menu handle | _fill in_ | Header / drawer |
| Metaobject: reviews | `featured_review` | `sections/featured-reviews-carousel.liquid` |
| Metaobject: stores | `store_location` | `sections/store-locator.liquid` |
| Reviews page | `pages.reviews` or `/pages/reviews` | Featured reviews section fallback |
| Brand / legal emails or URLs | _fill in_ | Support, privacy, etc. if agents need them |

**Secrets:** Do not commit API keys, app secrets, or private app tokens. Put them in Shopify environment / app config only; here document *where* they live, not the values.

---

## Commands

```bash
shopify theme dev
shopify theme deploy
```

---

## Theme conventions (high signal)

- **Section schema:** Shopify allows only **one** `link_list` (and similar resource pickers) in the **section root** `settings` array. Extra menus belong in **blocks** (e.g. footer `footer_column` blocks, max 3).
- **App blocks:** Sections that declare an `@app` block face stricter resource-picker limits. This footer does **not** use `@app`; do not reintroduce multiple `link_list` definitions + `@app` without checking current Shopify docs.
- **Auto-generated JSON:** Some group JSON (e.g. `sections/footer-group.json`) may be overwritten by the theme editor — note that in PRs if you hand-edit.

---

## Useful paths

| Area | Path |
|------|------|
| Layout | `layout/theme.liquid` |
| Homepage | `templates/index.json` |
| Footer | `sections/footer.liquid`, `sections/footer-group.json`, `assets/section-footer-editorial.css` |
| Featured reviews | `sections/featured-reviews-carousel.liquid` |
| Privacy / cookie banner CSS | `assets/shopify-privacy-banner-overrides.css` |
