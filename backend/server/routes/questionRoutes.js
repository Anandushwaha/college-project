import express from "express";
import Question from "../models/Qestion.js"; // Create a model for questions (see below)
const router = express.Router();

// Route to get all questions
router.get("/", async (req, res) => {
  try {
    const questions = await Question.find();
    res.status(200).json(questions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching questions" });
  }
});

// Route to post a new question
router.post("/", async (req, res) => {
  const { question, studentName, questionDate } = req.body;

  const newQuestion = new Question({
    question,
    studentName,
    questionDate,
    answers: [],
  });

  try {
    const savedQuestion = await newQuestion.save();
    res.status(201).json(savedQuestion);
  } catch (error) {
    res.status(500).json({ message: "Error posting question" });
  }
});

// Route to post an answer to a question
router.post("/answer", async (req, res) => {
  const { questionId, teacherAnswer, teacherName, answerDate } = req.body;

  try {
    const question = await Question.findById(questionId);
    if (!question)
      return res.status(404).json({ message: "Question not found" });

    question.answers.push({ teacherAnswer, teacherName, answerDate });
    const updatedQuestion = await question.save();

    res.status(200).json(updatedQuestion);
  } catch (error) {
    res.status(500).json({ message: "Error answering question" });
  }
});

export default router;
