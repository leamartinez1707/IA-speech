import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";
import fs from "fs";
import path from "path";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/api/speak", async (req, res) => {
  const { text, speaker } = req.body;
  if (!text || !speaker) {
    return res.status(400).json({ error: "Text and speaker are required." });
  }

  try {
    const completion = await openai.audio.speech.create({
      model: "tts-1",
      voice: speaker,
      input: text,
      response_format: "mp3"
    });

    const audioBuffer = Buffer.from(await completion.arrayBuffer());
    const audioFilePath = path.join(process.cwd(), "temp_audio.mp3");
    fs.writeFileSync(audioFilePath, audioBuffer);
    res.setHeader("Content-Type", "audio/mp3");
    res.sendFile(audioFilePath, (err) => {
      if (err) {
        console.error("Error sending audio file:", err);
        return res.status(500).json({ error: "Failed to send audio file." });
      }
      fs.unlinkSync(audioFilePath);
    });
  } catch (error) {
    console.error("Error during OpenAI API call:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
