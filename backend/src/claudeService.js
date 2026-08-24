const Anthropic = require("@anthropic-ai/sdk");
const fs = require("fs");
require("dotenv").config();

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const readReceipt = async (imageBuffer, mimeType = "image/jpeg") => {
  let imageData = imageBuffer;
  let finalMimeType = mimeType;

  const header = imageData.slice(4, 12).toString("ascii");
  if (header.includes("ftyp")) {
    const heicConvert = require("heic-convert");
    const jpegBuffer = await heicConvert({
      buffer: imageData,
      format: "JPEG",
      quality: 0.8,
    });
    imageData = Buffer.from(jpegBuffer);
    finalMimeType = "image/jpeg";
  }

  const base64Image = imageData.toString("base64");

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: "image/jpeg",
              data: base64Image,
            },
          },
          {
            type: "text",
            text: `Analyze this receipt image and respond ONLY with JSON, no markdown:
{
  "store_name": "store name",
  "amount": 0.00,
  "category": "one of: groceries, food, dining, shopping, transport, entertainment, health, other",
  "date": "YYYY-MM-DD"
}
If you cannot read the receipt clearly, make your best guess. For date, use today if not visible.`,
          },
        ],
      },
    ],
  });

  const cleaned = message.content[0].text.replace(/```json|```/g, "").trim();
  const data = JSON.parse(cleaned);

  return { data, buffer: imageData, mimeType: finalMimeType };
};

module.exports = { readReceipt };
