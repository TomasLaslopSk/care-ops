# care-carer-kmp — mobilná carer appka (Kotlin Multiplatform)

Compose Multiplatform appka, ktorá verne kopíruje stack a vzory z `ceracare/family_app`.
Carer sa prihlási a vidí **svoje** visity; relative vidí visity **svojho klienta**
(backend filtruje podľa tokenu). Beží na **Android + iOS**, ťahá z `care-api`.

**Obrazovky:** Login → zoznam visít (klik otvorí detail) → **detail vizity**
(check-in / vyplniť report / check-out — len pridelený carer) + **Chat** (kanál
carera resp. klienta; bez SSE — pollovanie každé 4s, lebo RN/KMP nemá EventSource).
Dátumy sú formátované cez `kotlinx-datetime` (predtým sa zobrazoval surový ISO).

> ⚠️ Tento projekt som **nezbuildil** (KMP potrebuje JDK + Gradle + Android SDK + Xcode,
> čo v mojom prostredí nie je). Je nascaffoldovaný podľa vzorov family_app; build
> a spustenie si urobíš v Android Studiu / Xcode. Android strana je plne pripravená;
> iOS potrebuje doplniť Xcode projekt (viď nižšie).

## Stack (zhodný s family_app, orezaný)
- **Compose Multiplatform 1.10.3**, Kotlin 2.3.21, AGP 8.13
- Moduly **`shared`** (logika) + **`composeApp`** (UI) — presne ako family_app
- **Ktor** klient (Bearer token), **kotlinx.serialization** DTO
- **Koin** DI (`single`/`viewModel`), **Compose Navigation** (`@Serializable` routy)
- **ViewModel + Repository** vzor, `expect/actual` pre platform-špecifické veci
- (Vynechané oproti family_app kvôli minimalizmu: Room/SQLCipher, Firebase, Coil,
  multiplatform-settings, ktlint/mokkery.)

## Štruktúra
```
shared/src/commonMain/.../shared/
  network/   ApiConfig (expect/actual baseUrl), HttpClientFactory
  network/dto/ Dtos.kt        (LoginRequest/Response, UserDto, Visit, VisitsResponse)
  session/   SessionStore     (token + user, in-memory)
  auth/      AuthRepository    (POST /auth/login)
  visits/    VisitsRepository  (GET /visits — backend scopes by token)
  di/        SharedModule      (Koin: client, repos, session)
shared/src/androidMain  ApiConfig.android (10.0.2.2), Ktor OkHttp engine
shared/src/iosMain      ApiConfig.ios (localhost), Ktor Darwin engine

composeApp/src/commonMain/.../carer/
  app/       App.kt, navigation/AppRoute.kt + AppGraph.kt
  feature/login/   LoginViewModel + LoginScreen
  feature/visits/  VisitsViewModel + VisitsScreen
  theme/     CeraTheme + CeraColors
  di/        AppModule (viewModels), InitKoin
composeApp/src/androidMain  CarerApplication (Koin init), MainActivity, AndroidManifest
composeApp/src/iosMain      MainViewController (Compose entry)
iosApp/     iOSApp.swift, ContentView.swift, Info.plist
```

## Ako to mapuje na family_app
| Tu | family_app |
|---|---|
| `composeApp` + `shared` moduly | rovnaké |
| `AppRoute` (`@Serializable` sealed interface) + `AppGraph` (`composable<Route>`) | `app/navigation/AppRoute.kt`, `AppGraph.kt` |
| `koinViewModel()` v obrazovkách, `viewModel { }` v module | `di/AppModule.kt` |
| `HttpClientFactory` (Ktor) | `shared/network/HttpClientFactory.kt` (ich má navyše Auth plugin + refresh) |
| `expect/actual apiBaseUrl` | `expect/actual` všade v shared |
| `CeraTheme` (M3 dark) | `theme/CeraTheme.kt` (ich má aj typografiu/shapes/spacing) |
| `SessionStore` (in-memory) | ich `sessionStore` + multiplatform-settings (perzistencia) |

## Spustenie

### Predpoklady
- Android Studio (s KMP pluginom), JDK 17+, Android SDK
- Pre iOS: Mac + Xcode 16
- Beží **`care-api`** na `:3001` (`cd ../care-api && npm run dev`)

### Gradle wrapper
V repo nie je `gradle-wrapper.jar` (binárka). Vygeneruj raz:
```sh
cd care-carer-kmp
gradle wrapper --gradle-version 8.13      # ak máš gradle nainštalovaný
# alebo jednoducho otvor projekt v Android Studiu — ponúkne dogenerovať wrapper
```

### Android
```sh
./gradlew :composeApp:installDebug      # alebo Run v Android Studiu
```
Appka beží na emulátore; `10.0.2.2:3001` smeruje na tvoj localhost (care-api).
Prihlás sa demo carerom: `amara@care.test` / `carer123` → uvidíš len jeho visity.

### iOS
KMP iOS appka potrebuje Xcode projekt, ktorý sa nedá vygenerovať ručne. Najľahšie:
vytvor projekt cez **Android Studio → New → Kotlin Multiplatform App** (alebo skopíruj
`iosApp.xcodeproj` z čerstvého KMP template) a nahraď Swift súbory tými z `iosApp/`.
ContentView volá `MainViewControllerKt.MainViewController()` z exportovaného frameworku.

## Pre pohovor
"Mobilnú carer appku som postavil v Compose Multiplatform zrkadliac family_app:
shared modul (Ktor + Koin + repozitáre + DTO + expect/actual) a composeApp
(Compose Navigation s typovými routami, ViewModely cez Koin). Tá istá `care-api`
a tá istá rola-based autorizácia ako web — carer cez svoj token dostane len svoje visity."
