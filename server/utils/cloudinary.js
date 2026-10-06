const { v2: cloudinary } = require('cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Uploads a memory buffer to Cloudinary and resolves with the upload result.
const uploadBuffer = (buffer, folder, resourceType = 'image') =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    stream.end(buffer);
  });

// Uploads one photo or video and returns the media shape stored in the database.
const uploadMediaFile = async (file, folder) => {
  const result = await uploadBuffer(file.buffer, folder, 'auto');
  return {
    url: result.secure_url,
    publicId: result.public_id,
    type: result.resource_type === 'video' ? 'video' : 'image',
  };
};

// Removes stored media from Cloudinary and never throws so a failed cleanup cannot block the request.
const deleteMedia = (media) =>
  Promise.allSettled(
    media.map((item) => cloudinary.uploader.destroy(item.publicId, { resource_type: item.type }))
  );

// Uploads every post file in parallel and rolls back the uploaded ones if any file fails.
const uploadMedia = async (files) => {
  const results = await Promise.allSettled(files.map((file) => uploadMediaFile(file, 'campus-connect/posts')));

  const uploaded = results.filter((r) => r.status === 'fulfilled').map((r) => r.value);
  const failed = results.find((r) => r.status === 'rejected');
  if (failed) {
    await deleteMedia(uploaded);
    throw failed.reason;
  }
  return uploaded;
};

// Uploads one event banner image and returns the banner shape stored in the database.
const uploadBanner = async (file) => {
  const result = await uploadBuffer(file.buffer, 'campus-connect/events', 'image');
  return { url: result.secure_url, publicId: result.public_id };
};

module.exports = { uploadBuffer, uploadMediaFile, uploadMedia, uploadBanner, deleteMedia };