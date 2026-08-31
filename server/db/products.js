// Warstwa dostępu do danych produktów.
//
// Dane trzymane są obecnie w pamięci, w kształcie odpowiadającym wierszom
// przyszłej tabeli `products` w bazie danych. Gdy baza zostanie podłączona
// (np. PostgreSQL), wystarczy podmienić ciała funkcji poniżej na zapytania
// SQL — kontrakt (nazwy funkcji, parametry, kształt zwracanych obiektów)
// pozostaje bez zmian, więc warstwa routingu (routes/products.js) nie musi
// się zmieniać.

const categories = [
  { slug: 'kubki', name: 'Kubki i naczynia' },
  { slug: 'pudelka', name: 'Pudełka gastronomiczne' },
  { slug: 'eko', name: 'Opakowania ekologiczne' },
  { slug: 'czystosc', name: 'Środki czystości' },
  { slug: 'cukiernia', name: 'Cukiernia' },
];

const products = [
  { id: 1, category: 'kubki', name: 'Kubki papierowe do kawy 250 ml (50 szt.)', description: 'Jednorazowe kubki papierowe z podwójną powłoką, idealne do gorących napojów na wynos.', price: 24.90, stock: 340, image: 'https://images.unsplash.com/photo-1598908314732-07113901949e?auto=format&fit=crop&w=500&q=80' },
  { id: 2, category: 'kubki', name: 'Kubki PET transparentne 400 ml (50 szt.)', description: 'Przezroczyste kubki plastikowe do zimnych napojów, koktajli i smoothie.', price: 29.50, stock: 210, image: 'https://images.unsplash.com/photo-1615485736894-a2d2e6d4cd9a?auto=format&fit=crop&w=500&q=80' },
  { id: 3, category: 'kubki', name: 'Talerze papierowe okrągłe 23 cm (100 szt.)', description: 'Wytrzymałe talerze papierowe pokryte folią PE, odporne na tłuszcz i wilgoć.', price: 34.00, stock: 180, image: 'https://images.unsplash.com/photo-1608584811031-a164257a0d62?auto=format&fit=crop&w=500&q=80' },
  { id: 4, category: 'pudelka', name: 'Pudełka kraft na dania na wynos (100 szt.)', description: 'Ekologiczne pudełka kraft ze składanym wieczkiem, świetne na dania na wynos.', price: 59.00, stock: 95, image: 'https://images.unsplash.com/photo-1597974828431-9078248d8cc9?auto=format&fit=crop&w=500&q=80' },
  { id: 5, category: 'pudelka', name: 'Pojemniki 500 ml z pokrywką (50 kpl.)', description: 'Szczelne pojemniki gastronomiczne z pokrywką, bezpieczne w mikrofalówce.', price: 42.90, stock: 130, image: 'https://images.unsplash.com/photo-1597514402413-17eac2b501c0?auto=format&fit=crop&w=500&q=80' },
  { id: 6, category: 'pudelka', name: 'Pudełka na pizzę 32×32 cm (50 szt.)', description: 'Solidne pudełka na pizzę z tektury falistej, dobrze wentylowane.', price: 65.00, stock: 6, image: 'https://images.unsplash.com/photo-1626253934161-08cfea22e968?auto=format&fit=crop&w=500&q=80', badge: 'promo' },
  { id: 7, category: 'eko', name: 'Talerze z trzciny cukrowej, biodegradowalne (50 szt.)', description: 'W 100% kompostowalne talerze z włókna trzciny cukrowej — bez plastiku.', price: 48.00, stock: 75, image: 'https://images.unsplash.com/photo-1650963764655-91902eedb9bd?auto=format&fit=crop&w=500&q=80', badge: 'new' },
  { id: 8, category: 'eko', name: 'Sztućce drewniane, komplet (100 szt.)', description: 'Komplet sztućców z drewna brzozowego — widelec, nóż i łyżka w każdym zestawie.', price: 27.00, stock: 260, image: 'https://images.unsplash.com/photo-1638560926839-cb90ababd947?auto=format&fit=crop&w=500&q=80' },
  { id: 9, category: 'eko', name: 'Torby papierowe z uchwytem, brązowe (100 szt.)', description: 'Torby z papieru makulaturowego ze wzmocnionym uchwytem sznurkowym.', price: 38.50, stock: 150, image: 'https://images.unsplash.com/photo-1669384537216-24740a56a2d5?auto=format&fit=crop&w=500&q=80' },
  { id: 10, category: 'czystosc', name: 'Płyn do mycia naczyń, kanister 5 l', description: 'Skoncentrowany płyn do mycia naczyń dla gastronomii, delikatny dla skóry.', price: 44.90, stock: 40, image: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=500&q=80' },
  { id: 11, category: 'czystosc', name: 'Ręczniki papierowe ZZ, karton (20 szt.)', description: 'Ręczniki papierowe składane ZZ, karton zbiorczy do dozowników.', price: 72.00, stock: 55, image: 'https://images.unsplash.com/photo-1550963295-019d8a8a61c5?auto=format&fit=crop&w=500&q=80' },
  { id: 12, category: 'cukiernia', name: 'Pudełka na tort 26×26 cm (25 szt.)', description: 'Pudełka cukiernicze z okienkiem, idealne na torty i ciasta.', price: 55.00, stock: 0, image: 'https://images.unsplash.com/photo-1652862729869-2f4e80c1849d?auto=format&fit=crop&w=500&q=80' },
];

function getCategories() {
  return categories;
}

// Prosty ranking trafności dopasowania frazy do produktu — nazwa waży
// najwięcej, potem opis, potem kategoria. Przy podłączeniu prawdziwej bazy
// danych to miejsce, w którym docelowo stanie zapytanie do silnika
// pełnotekstowego (np. PostgreSQL tsvector / ts_rank).
function relevanceScore(product, needle) {
  const name = product.name.toLowerCase();
  const desc = (product.description || '').toLowerCase();
  const catName = (categories.find((c) => c.slug === product.category)?.name || '').toLowerCase();

  let score = 0;
  if (name === needle) score += 100;
  else if (name.startsWith(needle)) score += 60;
  else if (name.includes(needle)) score += 40;

  if (desc.includes(needle)) score += 15;
  if (catName.includes(needle)) score += 10;

  const words = needle.split(/\s+/).filter(Boolean);
  if (words.length > 1 && words.every((w) => name.includes(w))) score += 20;

  return score;
}

function getAllProducts({ category, q } = {}) {
  let results = category ? products.filter((p) => p.category === category) : products.slice();

  const needle = (q || '').trim().toLowerCase();
  if (needle) {
    results = results
      .map((p) => ({ product: p, score: relevanceScore(p, needle) }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((r) => r.product);
  }

  return results;
}

function getProductById(id) {
  return products.find((p) => p.id === id) || null;
}

let nextId = products.length + 1;

function addProduct({ name, category, description, price, stock, image, badge }) {
  const product = {
    id: nextId++,
    category,
    name,
    description: description || '',
    price: Number(price),
    stock: stock != null ? Number(stock) : 0,
    image,
    ...(badge ? { badge } : {}),
  };
  products.push(product);
  return product;
}

function updateProduct(id, { name, category, description, price, stock, image, badge }) {
  const product = products.find((p) => p.id === id);
  if (!product) return null;
  if (name !== undefined) product.name = name;
  if (category !== undefined) product.category = category;
  if (description !== undefined) product.description = description;
  if (price !== undefined) product.price = Number(price);
  if (stock !== undefined) product.stock = Number(stock);
  if (image !== undefined) product.image = image;
  if (badge !== undefined) {
    if (badge) product.badge = badge;
    else delete product.badge;
  }
  return product;
}

function deleteProduct(id) {
  const idx = products.findIndex((p) => p.id === id);
  if (idx === -1) return false;
  products.splice(idx, 1);
  return true;
}

module.exports = {
  getCategories,
  getAllProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
};
