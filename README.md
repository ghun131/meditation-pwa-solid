# Thiền Trúc Lâm - SolidJS Rewrite

This is a SolidJS + Vite rewrite of the original `truc-lam-meditation-pwa` React app.

## Stack

- SolidJS
- Vite
- TypeScript
- `vite-plugin-pwa`
- `@vercel/analytics`

## Commands

```bash
pnpm install
pnpm dev
pnpm build
pnpm lint
```

## Environment Variables

The app keeps the same runtime contract as the React version:

- `VITE_GMAIL_APPSCRIPT_ENDPOINT`
- `VITE_DATA_SHEET_ENDPOINT`

Start from `.env.example` when creating a local `.env`.

## Notes

- Public audio and icon assets are copied from the original PWA.
- Meditation flow state lives in `src/primitives/createMeditationSession.ts`.
- Wake lock handling lives in `src/primitives/useWakeLock.ts`.
# meditation-pwa-solid
