const heicConvert = require("heic-convert");

// Sniffs the file header for the ISOBMFF "ftyp" box (HEIC/HEIF signature)
// and converts to JPEG if found. Returns the buffer/mimeType unchanged otherwise.
const normalizeImage = async (buffer, mimeType) => {
  const header = buffer.slice(4, 12).toString("ascii");
  if (header.includes("ftyp")) {
    const jpegBuffer = await heicConvert({
      buffer,
      format: "JPEG",
      quality: 0.8,
    });
    return { buffer: Buffer.from(jpegBuffer), mimeType: "image/jpeg" };
  }
  return { buffer, mimeType };
};

module.exports = { normalizeImage };
