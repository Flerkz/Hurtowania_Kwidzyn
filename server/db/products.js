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
  { id: 1, category: 'kubki', name: 'Kubki papierowe do kawy 250 ml (50 szt.)', price: 24.90, image: 'https://images.unsplash.com/photo-1598908314732-07113901949e?auto=format&fit=crop&w=500&q=80' },
  { id: 2, category: 'kubki', name: 'Kubki PET transparentne 400 ml (50 szt.)', price: 29.50, image: 'https://images.unsplash.com/photo-1615485736894-a2d2e6d4cd9a?auto=format&fit=crop&w=500&q=80' },
  { id: 3, category: 'kubki', name: 'Talerze papierowe okrągłe 23 cm (100 szt.)', price: 34.00, image: 'https://images.unsplash.com/photo-1608584811031-a164257a0d62?auto=format&fit=crop&w=500&q=80' },
  { id: 4, category: 'pudelka', name: 'Pudełka kraft na dania na wynos (100 szt.)', price: 59.00, image: 'https://images.unsplash.com/photo-1597974828431-9078248d8cc9?auto=format&fit=crop&w=500&q=80' },
  { id: 5, category: 'pudelka', name: 'Pojemniki 500 ml z pokrywką (50 kpl.)', price: 42.90, image: 'https://images.unsplash.com/photo-1597514402413-17eac2b501c0?auto=format&fit=crop&w=500&q=80' },
  { id: 6, category: 'pudelka', name: 'Pudełka na pizzę 32×32 cm (50 szt.)', price: 65.00, image: 'https://images.unsplash.com/photo-1626253934161-08cfea22e968?auto=format&fit=crop&w=500&q=80' },
  { id: 7, category: 'eko', name: 'Talerze z trzciny cukrowej, biodegradowalne (50 szt.)', price: 48.00, image: 'https://images.unsplash.com/photo-1650963764655-91902eedb9bd?auto=format&fit=crop&w=500&q=80' },
  { id: 8, category: 'eko', name: 'Sztućce drewniane, komplet (100 szt.)', price: 27.00, image: 'https://images.unsplash.com/photo-1638560926839-cb90ababd947?auto=format&fit=crop&w=500&q=80' },
  { id: 9, category: 'eko', name: 'Torby papierowe z uchwytem, brązowe (100 szt.)', price: 38.50, image: 'https://images.unsplash.com/photo-1669384537216-24740a56a2d5?auto=format&fit=crop&w=500&q=80' },
  { id: 10, category: 'czystosc', name: 'Płyn do mycia naczyń, kanister 5 l', price: 44.90, image: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=500&q=80' },
  { id: 11, category: 'czystosc', name: 'Ręczniki papierowe ZZ, karton (20 szt.)', price: 72.00, image: 'https://images.unsplash.com/photo-1550963295-019d8a8a61c5?auto=format&fit=crop&w=500&q=80' },
  { id: 12, category: 'cukiernia', name: 'Pudełka na tort 26×26 cm (25 szt.)', price: 55.00, image: 'https://images.unsplash.com/photo-1652862729869-2f4e80c1849d?auto=format&fit=crop&w=500&q=80' },
];

function getCategories() {
  return categories;
}

function getAllProducts({ category } = {}) {
  return category ? products.filter((p) => p.category === category) : products;
}

function getProductById(id) {
  return products.find((p) => p.id === id) || null;
}

module.exports = { getCategories, getAllProducts, getProductById };
