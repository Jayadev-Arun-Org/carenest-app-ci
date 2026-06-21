const { BearerStrategy } = require('passport-azure-ad');
const passport = require('passport');

const options = {
  identityMetadata: `https://login.microsoftonline.com/${process.env.ENTRA_TENANT_ID}/v2.0/.well-known/openid-configuration`,
  clientID: process.env.ENTRA_CLIENT_ID,
  validateIssuer: true,
  passReqToCallback: false,
  loggingLevel: 'info',
  isB2C: false
};

const bearerStrategy = new BearerStrategy(options, (token, done) => {
  if (!token.oid) {
    return done(null, false);
  }
  const user = {
    id: token.oid,
    email: token.preferred_username,
    role: token.roles && token.roles.length > 0 ? token.roles[0] : 'Patient'
  };
  return done(null, user, token);
});

passport.use(bearerStrategy);

const verifyEntraToken = (req, res, next) => {
  passport.authenticate('oauth-bearer', { session: false }, (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ message: 'Invalid Entra ID token' });
    req.user = user;
    next();
  })(req, res, next);
};

module.exports = {
  bearerStrategy,
  verifyEntraToken
};
