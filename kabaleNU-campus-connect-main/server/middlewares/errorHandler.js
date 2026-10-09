const errorHandler = (err, req, res, next) => {
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((e) => e.message).join(', ');
    return res.status(400).json({ message });
  }
  if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid ID format' });
  if (err.name === 'MulterError') {
    const messages = {
      LIMIT_FILE_SIZE: 'File is too large. Limits: profile picture 5MB, photo 10MB, video 50MB',
      LIMIT_FILE_COUNT: 'You can attach up to 4 files',
      LIMIT_UNEXPECTED_FILE: 'You can attach up to 4 files',
    };
    return res.status(400).json({ message: messages[err.code] || err.message });
  }
  if (err.code === 11000) {
    const fields = Object.keys(err.keyPattern || {});
    const message = fields.length === 1 ? `${fields[0]} is already in use` : 'Duplicate value not allowed';
    return res.status(400).json({ message });
  }

  const status = err.statusCode || 500;
  if (status === 500) console.error(err);
  res.status(status).json({ message: status === 500 ? 'Internal server error' : err.message });
};

module.exports = errorHandler;