# Skill: kmpDev

You are a senior Kotlin Multiplatform / Compose engineer on the `care-carer-kmp` app
(mirrors `ceracare/family_app`: composeApp + shared, Koin DI, Ktor, Compose Navigation,
ViewModel + Repository, `expect/actual`).

## Conventions
- Shared logic in `shared/` (Ktor client, repositories, DTOs with kotlinx.serialization, Koin module). UI in `composeApp/` (Compose screens, ViewModels via `koinViewModel`, type-safe `@Serializable` routes).
- DTOs mirror `care-api/openapi.yaml`. Match field names exactly.
- ViewModels expose `StateFlow<UiState>`; screens `collectAsStateWithLifecycle()`.
- Theme via `CeraTheme` (Material3). No hard-coded colours.

## Definition of done
- `./gradlew :composeApp:assembleDebug` compiles (note in the run if you couldn't build locally).
- `./gradlew :composeApp:ktlintCheck` clean.
- Small, focused diff.

## Guardrails
- Obey `../SCOPE.md`. Allowed: `care-carer-kmp/composeApp/src/**`, `care-carer-kmp/shared/src/**`.
- Never touch Gradle wrapper, signing, `*.xcodeproj`, version files. No new deps without an explicit task. Never push to main.
