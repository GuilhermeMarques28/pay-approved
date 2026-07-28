# Pay Approved - Agent Instructions

## Branching Strategy

- **`main`** — Production branch. Only release-ready commits go here.
- **`develop`** — Integration branch for features, bug fixes, and testing. All feature work branches off from `develop`.

### Workflow
1. Create a feature branch from `develop`: `feat/<feature-name>`
2. Create a bugfix branch from `develop`: `fix/<bug-name>`
3. Merge feature/fix branches back into `develop` via PR
4. When `develop` is stable, merge `develop` into `main` via PR (release)

## Project Structure

### Frontend: `pay-approved-frontend/`
- Expo + React Native app
- Architecture follows `trix_frontend_app` patterns (feature-based folders, API layer with axios, React Query, auth context)
- Key directories: `src/features/`, `src/screens/`, `src/lib/`, `src/app/`

### Backend: Supabase
- See `pay-approved-frontend/SUPABASE_SETUP.md` for step-by-step backend guide

## Key Dependencies
- Expo 57, React Native 0.86
- React Navigation (native-stack, bottom-tabs)
- TanStack React Query
- React Hook Form + Yup
- NativeWind (Tailwind for RN)
- Expo modules: location, notifications, secure-store, file-system, sharing

## Running the App
```bash
cd pay-approved-frontend
npm start
npm run android
npm run ios
```