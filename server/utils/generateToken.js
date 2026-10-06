const jwt = require('jsonwebtoken');

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
};

const generateToken = (res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

  // The cookie lifetime is read from the token so both always expire together.
  const { exp } = jwt.decode(token);
  res.cookie('jwt', token, { ...cookieOptions, maxAge: exp * 1000 - Date.now() });
};

module.exports = generateToken;
module.exports.cookieOptions = cookieOptions;
