# AGENTS.md - Judgement Bingo

## Project Purpose

Family event bingo app for tracking funny predictions during vacations and gatherings. Players create prompts about
things they think will happen (e.g., "Dad calls one of us fat"), build bingo cards from the shared prompt pool, then
mark squares as predictions come true. Not intended for public use — trusted internal/family use and Firebase POC.

## Tech Stack

- **Framework**: Angular 21 (standalone components, signals-based)
- **UI Components**: Angular Material 21 (M3 theming)
- **Custom Styling**: Tailwind CSS v4 (`@import 'tailwindcss'` in `src/styles.css`)
- **Firebase**: Direct Firebase JS SDK v12 (`firebase` npm package). **No @angular/fire** — Angular Firebase integration
  does not yet support Angular 21.
- **Database**: Cloud Firestore
- **Auth**: Firebase Auth (Google Sign-In + email/password)
- **Hosting**: Firebase App Hosting (Cloud Run)
- **Testing**: Vitest + jsdom (`ng test` uses `@angular/build:unit-test`)
- **Package Manager**: npm

## Project Structure

```
src/
  main.ts                        # Bootstrap
  index.html                     # Shell with Roboto + Material Icons fonts
  styles.css                     # Global styles (Tailwind import)
  material-theme.scss            # Angular Material M3 theme (azure primary, blue tertiary)
  app/
    app.ts                       # Root component (minimal, just <router-outlet>)
    app.config.ts                # Application config + Firebase injection tokens
    app.routes.ts                # Route definitions with lazy loading + auth guard
    auth/
      auth.service.ts            # Firebase Auth wrapper (user$ observable, Google + email sign-in)
      auth.guard.ts              # Functional CanActivate guard, redirects to /login
      login/
        login.ts/html/css        # Login page component
    features/
      games/
        games.ts/html/css        # Games list page (search + FAB for new game)
        games.service.ts         # Firestore games collection service
        components/
          game-card/             # Individual game card component
          new-game-dialog/       # MatDialog for creating a new game
      game/
        game.ts/html/css         # Game detail shell (renders <router-outlet> for child routes)
        pages/
          admin/                 # Game admin page (placeholder)
    shared/
      models/
        game.model.ts           # GameModel interface
        index.ts                 # Barrel export
  environments/
    environment.default.ts      # Firebase project config (safe to commit — project linking only)
spec/
  project_overview.md           # Domain concepts, entity definitions, game phases
public/
  assets/                       # Static assets (e.g., icons/google.svg)
  favicon.ico
```

## Path Aliases (tsconfig.json)

| Alias             | Resolves To            |
|-------------------|------------------------|
| `@shared/*`       | `./src/app/shared/*`   |
| `@features/*`     | `./src/app/features/*` |
| `@environments/*` | `./src/environments/*` |

## Firebase Architecture

### Injection Tokens (app.config.ts)

Firebase services are initialized at the module level and provided via `InjectionToken`:

- `FIREBASE_APP` — `FirebaseApp` instance
- `FIRESTORE` — `Firestore` instance
- `AUTH` — `Auth` instance

All three are `providedIn: 'root'` with factory functions. Inject them in services using `inject(TOKEN)`.

### Emulator Configuration

All local development uses Firebase emulators (hardcoded in `app.config.ts`):

- **Firestore**: `127.0.0.1:8080`
- **Auth**: `http://127.0.0.1:9099` (with `disableWarnings: true`)

Emulators are configured in `firebase.json` under `emulators`. Run with `firebase emulators:start`.

### Firestore Service Pattern

Services use the raw Firestore SDK directly. Typical pattern from `GamesService`:

- Inject `FIRESTORE` token
- Use `collection()`, `onSnapshot()`, `query()`, `addDoc()` from `firebase/firestore`
- Wrap `onSnapshot` in `Observable` for Angular reactive integration
- Convert Firestore `Timestamp` fields to JS `Date` in a `toModel()` mapping function
- Convert JS `Date` to `Timestamp` when writing via `Timestamp.fromDate()`

Collection name is a module-level `const` (e.g., `const COLLECTION = 'games'`).

## Domain Model

See `spec/project_overview.md` for full definitions. Key entities:

| Entity      | Description                                                                                       |
|-------------|---------------------------------------------------------------------------------------------------|
| GameModel   | A bingo session with players and cards, occurring over an event time period                       |
| User        | An authenticated Firebase user                                                                    |
| Player      | A game participant linked to a User                                                               |
| Subject     | A person/group referenced in prompts but not playing (e.g., "Dad", "other")                       |
| Prompt      | A prediction text + target reference. Represents a bingo square. 4 states (see below)             |
| Prompt Pool | Shared pool of accepted prompts that players choose from to build cards (excluding self-targeted) |
| BingoCard   | A player's assembled card from the prompt pool                                                    |

### Prompt Phases

1. **Submitted** — Created by a player
2. **Accepted** — Validated by another player
3. **Fulfilled** — A player flagged the prediction occurred
4. **Resolved** — A second player confirmed it occurred

### Game Phases

1. **Setup** — Invite/kick players, add subjects
2. **Prompting** — Players create and accept prompts
3. **Construction** — Players build bingo cards from the prompt pool
4. **Play** — Players flag fulfilled prompts
5. **Complete** — Winner declared; players can continue tracking

## Current Implementation Status

### Implemented

- Firebase app initialization with injection tokens
- Auth service with Google Sign-In and email/password
- Auth guard protecting routes
- Login page with email/password form + Google button
- Games list page with search/filter and new game dialog
- Game card component
- Firestore `GamesService` (CRUD for games collection)
- Game detail page shell with child routing
- Angular Material M3 theme configuration
- Firebase emulators for local development

### Not Yet Implemented

- Player management (within a game)
- Subject management
- Prompt creation, acceptance, and pool
- Bingo card construction
- Play phase (flagging prompts, checking off squares)
- Game phase state machine
- Admin functionality (currently placeholder)
- Firestore security rules (currently open with time-based expiry)
- Firestore indexes
- Production Firebase config (emulators only currently)

## Routes

| Path               | Component | Guard       | Notes                           |
|--------------------|-----------|-------------|---------------------------------|
| `/login`           | `Login`   | —           | Email/password + Google sign-in |
| `/`                | —         | —           | Redirects to `/games`           |
| `/games`           | `Games`   | `authGuard` | Lazy loaded                     |
| `/games/:id`       | `Game`    | `authGuard` | Lazy loaded, has children       |
| `/games/:id/admin` | `Admin`   | —           | Child of Game, lazy loaded      |

## Development Conventions

- **Standalone components only** — No NgModules. All imports declared inline in `@Component.imports`.
- **Signals over observables for local state** — Use `signal()` and `computed()` for component state. Use `toSignal()`
  to bridge observables from services.
- **Functional guards** — `CanActivateFn` style, not class-based.
- **Inject pattern** — Use `inject()` constructor injection, not constructor parameters.
- **`Injectable({ providedIn: 'root' })`** — All services are tree-shakable singletons.
- **Angular Material components** — Use Material components for UI primitives (buttons, cards, dialogs, form fields,
  etc.).
- **Tailwind for layout/custom styling** — Use Tailwind utility classes for spacing, layout, and custom visual tweaks
  beyond Material defaults.
- **Lazy-loaded routes** — Feature pages use `loadComponent` with dynamic imports and path aliases.
- **Firestore in services** — All Firestore access goes through dedicated services, never directly in components.
- **No @angular/fire** — Always use the raw `firebase` and `firebase/firestore` packages directly.

## Key Commands

| Command                    | Description                      |
|----------------------------|----------------------------------|
| `npm run dev`              | Start Angular dev server         |
| `npm run build`            | Production build                 |
| `npm test`                 | Run unit tests (Vitest)          |
| `firebase emulators:start` | Start Firestore + Auth emulators |

## Notes

- The `environment.default.ts` config is safe to commit — it contains project linking info, not authentication secrets.
- Firestore rules are currently wide open with a 30-day expiry. Security rules need to be written before any real use.
- There are no Firestore indexes defined yet; add them to `firestore.indexes.json` as query patterns emerge.
- The app is configured for Firebase App Hosting with a min-instances of 0 (scales to zero when idle).
