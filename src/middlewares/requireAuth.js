export function requireAuth(req, res, next) {
  if (!req.session.administradorId) {
    console.log("Tentativa sem login");
    return res.status(401).json({ error: "Usuário não autenticado" });
  }
  next();
}
