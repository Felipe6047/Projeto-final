const jwt = require('jsonwebtoken');

function auth(requiredRoles = []) {
  return (req, res, next) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ erro: 'Token não informado' });
    }

    try {
      const token = header.split(' ')[1];
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      req.usuario = payload;

      if (requiredRoles.length && !requiredRoles.includes(payload.tipo)) {
        return res.status(403).json({ erro: 'Acesso negado' });
      }
      next();
    } catch {
      return res.status(401).json({ erro: 'Token inválido ou expirado' });
    }
  };
}

module.exports = { auth };
