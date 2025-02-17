const express = require("express");
const mongoose = require("mongoose");
const { NlpManager } = require("node-nlp");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");

// اتصال به MongoDB
mongoose
  .connect(
    "mongodb+srv://ess41380:l12BNoo1bb8ZlJyB@cluster0.wyyjq.mongodb.net/?retryWrites=true&w=majority"
  )
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

// تعریف اسکیمای سوالات
const QuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  intent: { type: String, required: true },
  response: { type: String, required: true },
});
const Question = mongoose.model("Question", QuestionSchema);

// ایجاد و پیکربندی مدل NLP
const manager = new NlpManager({ languages: ["fa"], forceNER: true });

// آموزش مدل NLP (دستی)
const trainModel = async () => {
  try {
    manager.nlp = new NlpManager({ languages: ["fa"], forceNER: true }); // پاکسازی مدل قبلی
    const questions = await Question.find();
    for (const q of questions) {
      manager.addDocument("fa", q.question, q.intent);
      manager.addAnswer("fa", q.intent, q.response);
    }
    await manager.train();

    // ذخیره مدل در فایل
    await manager.save("model.nlp");

    console.log("Model trained successfully.");
  } catch (error) {
    console.error("Error training model:", error);
  }
};

// پیش‌بینی نیت با استفاده از مدل NLP
const detectIntent = async (input) => {
  const response = await manager.process("fa", input);
  console.log("Detected intent:", response, "with score:", response.score);
  return response;
};

// راه‌اندازی سرور
const app = express();
app.use(bodyParser.json());
app.use(cors());

// API چت
app.post("/chat", async (req, res) => {
  try {
    const { question } = req.body;
    if (!question || question.trim() === "") {
      return res.json({ response: "لطفاً سوال خود را وارد کنید." });
    }

    const intent = await detectIntent(question);

    // بررسی اگر intent پیش‌بینی‌شده NaN است
    if (!intent.intent || intent.score < 0.7) {
      return res.json({
        response: "متوجه سوال شما نشدم. لطفاً سوال را واضح‌تر بپرسید.",
      });
    }

    const matchedQuestion = await Question.findOne({
      intent: intent.intent,
    });

    if (matchedQuestion) {
      res.json({ response: matchedQuestion.response });
    } else {
      res.json({
        response: "متاسفانه من پاسخ دقیقی برای سوال شما ندارم.",
        // افزودن سوال به فایل جهت بررسی سوالات جدید*******************
      });
    }
  } catch (error) {
    console.error("Error in /chat API:", error);
    res.status(500).json({
      error: "مشکلی در پردازش درخواست شما وجود دارد. لطفاً دوباره تلاش کنید.",
    });
  }
});

// API بازآموزی مدل (فراخوانی دستی)
app.post("/train-model", async (req, res) => {
  try {
    await trainModel();
    res.json({ message: "مدل با موفقیت بازآموزی شد." });
  } catch (error) {
    console.error("Error in /train-model API:", error);
    res.status(500).json({ error: "خطا در بازآموزی مدل." });
  }
});

// شروع سرور
app.listen(3000, async () => {
  console.log("Chatbot running on http://localhost:3000");

  // بارگذاری مدل در زمان راه‌اندازی
  if (fs.existsSync("model.nlp")) {
    try {
      await manager.load("model.nlp");
      console.log("Model loaded successfully.");
    } catch (error) {
      console.error("Error loading model:", error);
    }
  } else {
    console.log("No pre-trained model found. Training a new model...");
    await trainModel();
  }

  // API افزودن سوال جدید
  // app.post("/add-question", async (req, res) => {
  //   try {
  //     const { question, response } = req.body;
  //     if (!question || !response) {
  //       return res
  //         .status(400)
  //         .json({ error: "سوال و پاسخ نمی‌توانند خالی باشند." });
  //     }

  //     const intent = Math.floor(Math.random() * 1000); // تولید یک عدد تصادفی برای intent

  //     // بررسی اگر intent پیش‌بینی‌شده NaN است
  //     if (!intent.intent || intent.score < 0.7) {
  //       return res.json({
  //         response: "متوجه سوال شما نشدم. لطفاً سوال را واضح‌تر بپرسید.",
  //       });
  //     }

  //     const newQuestion = new Question({
  //       question,
  //       intent: parseInt(intent),
  //       response,
  //     });
  //     await newQuestion.save();

  //     res.json({ message: "سوال جدید ذخیره شد." });
  //   } catch (error) {
  //     console.error("Error in /add-question API:", error);
  //     res.status(500).json({ error: "خطا در ذخیره سوال جدید." });
  //   }
  // });

  // try {
  //   const questions = await Question.find();
  //   if (questions.length > 0) {
  //     await trainModel(questions);
  //   } else {
  //     console.log("No questions found. Please add some questions.");
  //   }
  // } catch (error) {
  //   console.error("Error during initial model setup:", error);
  // }
});