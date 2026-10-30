# storm-staff

The staff extensions behind [storm](https://stormd.site): bots and anything else
that works for the team rather than serving content. Each **extension** runs on
the site, which downloads it from this repo, checks its signature, and gives it
its own on/off switch and settings in Admin → Addons.

```
packages/sdk     the contract an extension is written against
extensions/      one folder per extension
scripts/         build-repo, keys
```

| extension | what it does |
| --- | --- |
| `discord` | posts news and alerts to Discord channels, and gives staff slash commands |
| `telegram` | the same on Telegram |

## How an extension works

An extension exports `defineAddon({ pkg, name, version, description, settings })`
and implements what it needs:

| `onEvent(event, ctx)` | something happened on storm: an announcement, a ticket, a staff sign-in |
| `hook(request, ctx)` | its outside service sent a request; it must prove who's calling |
| `sync(ctx)` | settings changed, so tell the outside service |

Extensions never reach the site's database or files. The site hands them `ctx`:

| `ctx.settings` | this extension's settings, secrets included |
| `ctx.commands` | the staff slash commands to offer |
| `ctx.run` | runs a command as someone; staff checks and the audit log happen on storm |
| `ctx.fetch` | requests with a timeout |

## Adding an extension

Add `extensions/<name>/src/index.ts`, then `bun test` and `bun run typecheck`.
Changing an extension means bumping its version. Every push to `main` publishes a
signed build to the `repo` branch.

## Signing

`bun run keys` makes a key pair. The private key is the `STORM_SIGNING_KEY` secret
on GitHub; the public key goes in the site's `ADDONS_PUBLIC_KEY`.
