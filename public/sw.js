// Service worker do Repositório GEPEN.
//
// O que ele faz:
// - Guarda no cache do navegador a ÁREA PÚBLICA (catálogo, login, CSS,
//   ícones e a última lista de recomendações), para o catálogo abrir sem internet.
// - Sempre tenta a rede primeiro; o cache só é usado quando a rede falha.
//   Assim, com internet, o site mostra sempre a versão mais nova.
// - NÃO guarda a área administrativa nem nada que dependa de login.
//
// Ao mudar a lista de arquivos abaixo, troque a VERSAO (ex.: "gepen-v2")
// para o navegador descartar o cache antigo.

const VERSAO = "gepen-v1";

const ARQUIVOS_INICIAIS = [
  "/",
  "/index.html",
  "/login.html",
  "/offline.html",
  "/css/style.css",
  "/js/catalogo.js",
  "/js/login.js",
  "/js/pwa.js",
  "/manifest.webmanifest",
  "/img/logo-gepen-contorno.svg",
  "/img/app/icone-192.png",
  "/img/icones/busca.svg",
  "/img/icones/seta-baixo.svg",
  "/img/icones/filtro.svg",
  "/img/icones/fechar.svg",
  "/img/icones/usuario.svg",
  "/img/icones/link-externo.svg",
  "/img/icones/camadas.svg",
  "/img/icones/globo.svg",
  "/img/icones/calendario.svg",
  "/img/icones/nota.svg",
  "/img/icones/alerta.svg",
];

// Páginas e scripts da área administrativa: passam direto pela rede.
const AREA_ADMIN = [
  "/admin.html",
  "/contas.html",
  "/novo_card.html",
  "/editar_card.html",
  "/senha.html",
  "/js/admin.js",
  "/js/contas.js",
  "/js/novo_card.js",
  "/js/editar_card.js",
  "/js/senha.js",
];

self.addEventListener("install", (evento) => {
  evento.waitUntil(
    caches.open(VERSAO).then((cache) => cache.addAll(ARQUIVOS_INICIAIS)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((nomes) =>
        Promise.all(
          nomes.filter((nome) => nome !== VERSAO).map((nome) => caches.delete(nome)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

function ehAreaAdmin(url) {
  return (
    url.pathname.startsWith("/admin/") ||
    url.pathname === "/login" ||
    url.pathname === "/logout" ||
    AREA_ADMIN.includes(url.pathname)
  );
}

// Rede primeiro; se der certo, atualiza o cache. Se falhar, usa o cache.
async function redePrimeiro(pedido) {
  const cache = await caches.open(VERSAO);
  try {
    const resposta = await fetch(pedido);
    if (resposta.ok || resposta.type === "opaque") {
      cache.put(pedido, resposta.clone());
    }
    return resposta;
  } catch (erro) {
    const salva = await cache.match(pedido, { ignoreSearch: pedido.mode === "navigate" });
    if (salva) return salva;
    if (pedido.mode === "navigate") return cache.match("/offline.html");
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

  if (url.origin !== self.location.origin) return;

  // Área administrativa: sem cache. Offline, mostra a página "sem conexão".
  if (ehAreaAdmin(url)) {
    if (pedido.mode === "navigate") {
      evento.respondWith(
        fetch(pedido).catch(() => caches.match("/offline.html")),
      );
    }
    return;
  }

  evento.respondWith(redePrimeiro(pedido));
});
