import mongoose from "mongoose";

const answerSchema = new mongoose.Schema({
  teacherAnswer: { type: String, required: true },
  teacherName: { type: String, required: true },
  answerDate: { type: Date, required: true },
});

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  studentName: { type: String, required: true },
  questionDate: { type: Date, required: true },
  answers: [answerSchema], // Store answers in an array
});

const Question = mongoose.model("Question", questionSchema);

export default Question;
