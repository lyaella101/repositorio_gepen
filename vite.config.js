import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// O front-end em React fica na pasta web/.
// - Em desenvolvimento, o Express (src/server.js) carrega o Vite sozinho:
//   basta rodar `npm run dev` e abrir http://localhost:3000.
// - Para publicar, `npm run build` gera a pasta dist/, que o Express entrega.
export default defineConfig({
  root: "web",
  plugins: [react()],
  build: {
    outDir: "../dist",
    emptyOutDir: true,
  },
});
