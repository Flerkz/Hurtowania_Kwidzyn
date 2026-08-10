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
assets/                                                — CSS, JS, obrazy
server/                                                — API (Express) + serwowanie plików statycznych
  server.js
  routes/products.js
  db/products.js        — dane produktów (seam pod przyszłą bazę danych)
Dockerfile, docker-compose.yml                         — konteneryzacja (web + Postgres)
```

## API

| Metoda | Endpoint | Opis |
|---|---|---|
| GET | `/api/products` | Lista produktów (opcjonalnie `?category=kubki`) |
| GET | `/api/products/:id` | Pojedynczy produkt |
| GET | `/api/categories` | Lista kategorii |

Interaktywna dokumentacja (Swagger UI) ze wszystkimi endpointami: **http://localhost:8123/api-docs**
