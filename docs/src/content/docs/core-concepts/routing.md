---
title: 'Pages & Routing'
description: 'Set up client-side routing, nested pages, dynamic parameters, and guards.'
---

Avenx-JS features a built-in router designed for single-page applications. It handles hash-based navigation (e.g. `#/dashboard`), dynamic parameters, and guards.

## 1. Page Components (`.page.js`)

Pages are top-level components located inside `src/pages/`. They extend `AvenxPage` instead of `AvenxComponent`, enabling them to host child components dynamically.

## 2. Configuring the Router

Define routes in your `src/main.app.js` file by mapping path patterns to page names:

```javascript
import { AvenxApp } from 'avenx-core/runtime';

const app = new AvenxApp({ target: '#app' });

// Registering Pages (Normally automatically registered by compiler)
app.registerPage('Home', Home);
app.registerPage('Profile', Profile);

// Initialize router
app.initRouter({
  '/': 'Home',
  '/profile/:id': 'Profile',
  '*': 'Home', // Fallback route
});
```

## 3. Dynamic Route Parameters

Route segments starting with `:` are dynamic variables. The values parsed from the URL are automatically added to the Page component's `state` object and can be read inside templates or actions:

```html
<!-- src/pages/profile.page.js -->
<!-- state.id will contain the value from /profile/:id -->
<div class="profile">
  <h1>Viewing Profile ID: {{ id }}</h1>
</div>
```

## 4. Route Guards

Guards decide whether a transition to a page is allowed. Create a guard using the CLI:

```bash
npx avenx g guard auth
```

Implement the `canActivate(to, from)` method. Return a boolean, a redirect string, or a Promise:

```javascript
// src/guards/auth.guard.js
import { AvenxGuard } from 'avenx-core/runtime';

export default class AuthGuard extends AvenxGuard {
  canActivate(to, from) {
    // Return true to allow, false to block, or hash path to redirect
    if (to.hash === '#/dashboard' && !window.isLoggedIn) {
      return '#/login';
    }
    return true;
  }
}
```

:::caution
Redirect paths returned from `canActivate` must start with `#`. `AvenxRouter.navigate` only applies the configured `prefix` and namespace settings to hash paths — a path without the `#` prefix bypasses this resolution and can break navigation in apps served with a custom `prefix`.
:::warning
Redirect paths must start with a `#` prefix to ensure router prefix and namespace settings are respected.
:::

Map guards to routes in your application router initialization:

```javascript
app.initRouter({
  '/': 'Home',
  '/dashboard': { page: 'Dashboard', guards: [AuthGuard] },
});
```
