# PakoDirect — uruchomienie strony

Strona firmowa (statyczny front + małe API produktów) dla firmy oferującej opakowania jednorazowe dla gastronomii.

## Wymagania

- **Docker Desktop** (najprostsza opcja) — albo
- **Node.js ≥ 24** (uruchomienie bez Dockera)

## Opcja 1: Docker (zalecane)

Uruchamia stronę + API + pustą bazę PostgreSQL jedną komendą.

```bash
docker compose up -d
```

Strona będzie dostępna pod adresem: **http://localhost:8123**

Podgląd logów:

```bash
docker compose logs -f
```

Zatrzymanie:

```bash
docker compose down
```

Zatrzymanie z usunięciem danych bazy (czysty start):

```bash
docker compose down -v
```

Domyślne dane dostępowe do Postgresa (na razie pusta baza, bez tabel) zdefiniowane są w [.env.example](.env.example) — skopiuj do `.env`, jeśli chcesz je zmienić:

```bash
cp .env.example .env
```

## Opcja 2: bez Dockera (lokalny Node)

```bash
cd server
npm install
npm start
```

Strona będzie dostępna pod adresem: **http://localhost:8123**

W tym trybie potrzebujesz własnego, osobno uruchomionego PostgreSQL, jeśli chcesz podłączyć bazę — serwer obecnie serwuje dane produktów z pamięci (patrz [server/db/products.js](server/db/products.js)).

## Struktura projektu

```
index.html, produkty.html, o-nas.html, kontakt.html   — strony
koszyk.html, platnosc.html                             — koszyk i płatność (demo)
logowanie.html, panel.html                             — logowanie i panel admina
assets/                                                — CSS, JS, obrazy
  js/auth.js             — logowanie / sesja (JWT w localStorage), wspólne dla wszystkich stron
  js/cart.js              — koszyk (localStorage), współdzielony przez wszystkie strony
  js/cart-page.js          — logika strony koszyka
  js/checkout.js            — logika strony płatności
  js/login.js                — logika strony logowania
  js/panel.js                 — logika panelu admina (CRUD produktów)
server/                                                — API (Express) + serwowanie plików statycznych
  server.js
  middleware/auth.js     — weryfikacja JWT (requireAuth) i roli (requireAdmin)
  routes/auth.js, routes/products.js, routes/orders.js
  db/users.js, db/products.js, db/orders.js   — dane w pamięci (seam pod przyszłą bazę danych)
Dockerfile, docker-compose.yml                         — konteneryzacja (web + Postgres)
```

## Logowanie i panel admina

Logowanie zwraca token JWT (ważny 8h), trzymany w `localStorage` po stronie klienta. Role: `admin` i `customer`.

Konta demonstracyjne (zdefiniowane w [server/db/users.js](server/db/users.js)):

| Rola | E-mail | Hasło |
|---|---|---|
| admin | `admin@pakodirect.pl` | `Admin123!` |
| customer | `klient@pakodirect.pl` | `Klient123!` |

Po zalogowaniu jako **admin** w nagłówku pojawia się link „Panel admina” → [panel.html](panel.html), gdzie
można dodawać, edytować i usuwać produkty (widoczne od razu w sklepie). Zapisujące endpointy API
(`POST/PUT/DELETE /api/products`) wymagają tokenu z rolą `admin` (401 bez tokenu, 403 dla roli `customer`).

**To środowisko demonstracyjne** — hasła są zaszyte w kodzie (bcrypt) wyłącznie do celów prezentacji,
a `JWT_SECRET` ma placeholder w [.env.example](.env.example). Przed produkcyjnym użyciem: przenieś
użytkowników do prawdziwej bazy, wymuś silny, losowy `JWT_SECRET` z sekretów wdrożeniowych, i włącz rejestrację
z odpowiednią walidacją, jeśli jest potrzebna.

Koszyk i checkout **nie wymagają logowania** — każdy gość może dodać produkty do koszyka i przejść przez
[platnosc.html](platnosc.html).

## Koszyk i płatność

Koszyk działa w oparciu o `localStorage`. Strona [platnosc.html](platnosc.html) zbiera dane
do wysyłki i metodę płatności (karta / BLIK / Przelewy24 / za pobraniem), po czym wysyła zamówienie do
`POST /api/orders`. **To środowisko demonstracyjne — żadna z metod płatności nie łączy się z prawdziwym
operatorem płatności; status zamówienia jest symulowany.** Podłączenie realnego dostawcy płatności
(np. Stripe, Przelewy24, PayU) to kolejny krok, który wymaga osobnej integracji i kluczy API.

## API

| Metoda | Endpoint | Opis |
|---|---|---|
| POST | `/api/auth/login` | Logowanie — zwraca token JWT |
| GET | `/api/auth/me` | Dane zalogowanego użytkownika (wymaga tokenu) |
| GET | `/api/products` | Lista produktów (opcjonalnie `?category=kubki`) |
| GET | `/api/products/:id` | Pojedynczy produkt |
| POST | `/api/products` | Dodanie produktu — **tylko admin** |
| PUT | `/api/products/:id` | Edycja produktu — **tylko admin** |
| DELETE | `/api/products/:id` | Usunięcie produktu — **tylko admin** |
| GET | `/api/categories` | Lista kategorii |
| POST | `/api/orders` | Złożenie zamówienia (symulacja płatności) |
| GET | `/api/orders/:id` | Szczegóły zamówienia |

Interaktywna dokumentacja (Swagger UI) ze wszystkimi endpointami: **http://localhost:8123/api-docs**
