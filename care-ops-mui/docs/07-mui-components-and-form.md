# MUI komponenty + formulár (react-hook-form + yup)

Pokrýva `components/Filters.tsx`, `StatusChip.tsx`, `CarersList.tsx`,
`NewCarerForm.tsx` a stránku `pages/Carers.tsx`.

---

## Ako sa štýluje v MUI — `sx` prop
Namiesto Tailwind tried (`className="flex gap-2"`) majú MUI komponenty **`sx`**:
```tsx
<Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 3 }}>
```
- `sx` je objekt CSS-in-JS (cez Emotion). Kľúče sú CSS vlastnosti.
- Čísla pri spacingu (`gap: 2`, `mb: 3`) = násobky theme spacing jednotky (8px),
  takže `mb: 3` = 24px. Hodnoty ako `"text.secondary"` siahajú do theme palety.
Toto je hlavný rozdiel oproti Tailwind tracku: štýl je v JS objekte, nie v triedach.

---

## `Filters.tsx` — MUI Select + zustand
```tsx
<FormControl sx={{ width: 200 }} size="small">
  <InputLabel>Region</InputLabel>
  <Select label="Region" value={region} onChange={(e) => setRegion(e.target.value)}>
    <MenuItem value="">All</MenuItem>
    {REGIONS.map((r) => <MenuItem value={r} key={r}>{r}</MenuItem>)}
  </Select>
</FormControl>
```
- `FormControl` + `InputLabel` + `Select` + `MenuItem` — MUI skladačka pre dropdown.
  `Select` je riadený (`value` + `onChange`).
- Hodnoty `value`/`onChange` idú do zustand store (cez `useShallow`). Zmena filtra →
  zmena store → hook `useGetCarers` má nový queryKey → React Query refetchne. Reťaz
  je hotová bez manuálneho kódu.

---

## `StatusChip.tsx` — Chip = MUI obdoba Badge
```tsx
const colorByStatus: Record<CarerStatus, "success" | "warning" | "default"> = {
  active: "success", onboarding: "warning", inactive: "default",
};
<Chip label={status} color={colorByStatus[status]} size="small" variant="outlined" />
```
- `Chip` so sémantickou farbou z theme (`color="success"`), nie hex. To isté ako
  Badge v Tailwind tracku, len cez MUI prop.

---

## `CarersList.tsx` — tabuľka + 3 stavy
Najprv rieši **loading / error / empty**, až potom tabuľku:
```tsx
if (isLoading) return <CircularProgress />;
if (isError)   return <Typography color="error">Failed…</Typography>;
if (carers.length === 0) return <Typography>No carers…</Typography>;
return <TableContainer component={Paper}><Table>…</Table></TableContainer>;
```
- Tieto tri stavy ako jeden vzor sú JD bod ("loading/empty/error states as a pattern").
- `Table/TableHead/TableBody/TableRow/TableCell` = MUI tabuľka. `component={Paper}`
  dá kontajneru povrch z theme.

---

## `NewCarerForm.tsx` — react-hook-form + yup
```tsx
const schema = yup.object({
  name: yup.string().required("Name is required").min(2, "Too short"),
  region: yup.string().oneOf(REGIONS).required("Pick a region"),
});
type FormValues = yup.InferType<typeof schema>;

const { control, handleSubmit, reset, formState: { errors, isSubmitting } } =
  useForm<FormValues>({ resolver: yupResolver(schema), defaultValues: { name: "", region: "" } });
```
### Krok po kroku
- **yup schema** = pravidlá validácie deklaratívne (povinné, min dĺžka, povolené hodnoty).
- **`yup.InferType<typeof schema>`** — TS typ formulára sa **odvodí zo schémy**. Jeden
  zdroj pravdy: pravidlá aj typy z jedného miesta.
- **`useForm({ resolver: yupResolver(schema) })`** — react-hook-form napojený na yup;
  validácia beží automaticky.
- **`Controller`** — most medzi RHF a riadenými MUI poľami:
  ```tsx
  <Controller name="name" control={control} render={({ field }) => (
    <TextField {...field} error={!!errors.name} helperText={errors.name?.message} />
  )} />
  ```
  `field` nesie `value`/`onChange`/`onBlur`; chybu z validácie zobrazíme cez
  `error` + `helperText`.
- **`handleSubmit(submit)`** — spustí validáciu a `submit` zavolá len ak je formulár
  platný. `reset()` po odoslaní vyčistí polia. `isSubmitting` vie zablokovať tlačidlo.

Toto je presný vzor formulárov v micro-fes (`UploadForm` atď.).

---

## `pages/Carers.tsx` — zlepenie
Stránka spojí všetko: prečíta filtre zo store, zavolá `useGetCarers`, vykreslí
`NewCarerForm` + `Filters` + `CarersList`, a po odoslaní formulára ukáže MUI `Snackbar`.

## Pojmy
- **`sx` prop** = CSS-in-JS štýlovanie MUI komponentov (cez theme jednotky/farby).
- **riadený komponent** = hodnotu drží React state (`value` + `onChange`).
- **`Controller`** = napojí riadené pole na react-hook-form.
- **`yup.InferType`** = odvodenie TS typu zo validačnej schémy.

## Pre pohovor
"UI je MUI so `sx` štýlovaním z theme (žiadne hexy), stavy loading/error/empty ako
jeden vzor, formuláre react-hook-form + yup so schémou, z ktorej `InferType` odvodí aj
TS typ. Filtre cez zustand spúšťajú React Query refetch — celá reťaz bez `useEffect`."
