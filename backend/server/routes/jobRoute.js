import express from "express";
import { searchJobs } from "../controller/jobController.js";
const router = express.Router();

// Route to search for jobs
router.post("/search", searchJobs);

export default router;
