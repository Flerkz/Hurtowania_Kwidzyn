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
assets/                                                — CSS, JS, obrazy
  js/cart.js            — koszyk (localStorage), współdzielony przez wszystkie strony
  js/cart-page.js        — logika strony koszyka
  js/checkout.js          — logika strony płatności
server/                                                — API (Express) + serwowanie plików statycznych
  server.js
  routes/products.js, routes/orders.js
  db/products.js, db/orders.js   — dane w pamięci (seam pod przyszłą bazę danych)
Dockerfile, docker-compose.yml                         — konteneryzacja (web + Postgres)
```

## Koszyk i płatność

Koszyk działa w oparciu o `localStorage` (bez logowania). Strona [platnosc.html](platnosc.html) zbiera dane
do wysyłki i metodę płatności (karta / BLIK / Przelewy24 / za pobraniem), po czym wysyła zamówienie do
`POST /api/orders`. **To środowisko demonstracyjne — żadna z metod płatności nie łączy się z prawdziwym
operatorem płatności; status zamówienia jest symulowany.** Podłączenie realnego dostawcy płatności
(np. Stripe, Przelewy24, PayU) to kolejny krok, który wymaga osobnej integracji i kluczy API.

## API

| Metoda | Endpoint | Opis |
|---|---|---|
| GET | `/api/products` | Lista produktów (opcjonalnie `?category=kubki`) |
| GET | `/api/products/:id` | Pojedynczy produkt |
| GET | `/api/categories` | Lista kategorii |
| POST | `/api/orders` | Złożenie zamówienia (symulacja płatności) |
| GET | `/api/orders/:id` | Szczegóły zamówienia |

Interaktywna dokumentacja (Swagger UI) ze wszystkimi endpointami: **http://localhost:8123/api-docs**
