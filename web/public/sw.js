// Service worker do Repositório GEPEN (versão React).
//
// - Guarda no cache do navegador o aplicativo e a última lista de
//   recomendações, para o catálogo abrir sem internet.
// - Sempre tenta a rede primeiro; o cache só é usado quando a rede falha.
//   Assim, com internet, o site mostra sempre a versão mais nova.
// - Não guarda nada da área administrativa (/admin/..., login, logout).
//
// Só é registrado na versão publicada (npm run build + npm start).
// Ao mudar a lista abaixo, troque a VERSAO (ex.: "gepen-react-v2").

const VERSAO = "gepen-react-v1";

const ARQUIVOS_INICIAIS = [
  "/",
  "/manifest.webmanifest",
  "/img/logo-gepen-contorno.svg",
  "/img/app/icone-192.png",
];

self.addEventListener("install", (evento) => {
  evento.waitUntil(caches.open(VERSAO).then((cache) => cache.addAll(ARQUIVOS_INICIAIS)));
  self.skipWaiting();
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((nomes) => Promise.all(nomes.filter((n) => n !== VERSAO).map((n) => caches.delete(n))))
      .then(() => self.clients.claim()),
  );
});

function semCache(url) {
  return url.pathname.startsWith("/admin/") || url.pathname === "/login" || url.pathname === "/logout";
}

async function redePrimeiro(pedido, chave = pedido) {
  const cache = await caches.open(VERSAO);
  try {
    const resposta = await fetch(pedido);
    if (resposta.ok || resposta.type === "opaque") cache.put(chave, resposta.clone());
    return resposta;
  } catch (erro) {
    const salva = await cache.match(chave);
    if (salva) return salva;
    throw erro;
  }
}

self.addEventListener("fetch", (evento) => {
  const pedido = evento.request;
  if (pedido.method !== "GET") return;
  const url = new URL(pedido.url);

  // Fontes do Google: guardadas para o visual não mudar offline.
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    evento.respondWith(redePrimeiro(pedido));
    return;
  }

  if (url.origin !== self.location.origin || semCache(url)) return;

  // Navegação (/, /painel, /contas...): todas abrem o mesmo index.html do React.
  if (pedido.mode === "navigate") {
    evento.respondWith(redePrimeiro(pedido, "/"));
    return;
  }

  // JS/CSS do build, imagens e dados públicos (/cards, /tipos...).
  evento.respondWith(redePrimeiro(pedido));
});
