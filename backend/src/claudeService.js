const Anthropic = require("@anthropic-ai/sdk");
require("dotenv").config();

const { normalizeImage } = require("./imageUtils");

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const MODEL = "claude-sonnet-4-6";

const RECEIPT_PROMPT = `Analyze this receipt image and respond ONLY with JSON, no markdown:
{
  "store_name": "store name",
  "amount": 0.00,
  "category": "one of: groceries, food, dining, shopping, transport, entertainment, health, other",
  "date": "YYYY-MM-DD"
}
If you cannot read the receipt clearly, make your best guess. For date, use today if not visible.`;

const readReceipt = async (imageBuffer, mimeType = "image/jpeg") => {
  const { buffer: imageData, mimeType: finalMimeType } = await normalizeImage(
    imageBuffer,
    mimeType,
  );

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: finalMimeType,
              data: imageData.toString("base64"),
            },
          },
          { type: "text", text: RECEIPT_PROMPT },
        ],
      },
    ],
  });

  const textBlock = message.content.find((b) => b.type === "text");
  const cleaned = textBlock.text.replace(/```json|```/g, "").trim();

  let data;
  try {
    data = JSON.parse(cleaned);
  } catch {
    throw new Error("Claude returned unparseable JSON for this receipt");
  }

  return { data, buffer: imageData, mimeType: finalMimeType };
};

module.exports = { readReceipt };
