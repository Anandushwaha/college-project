import Course from "../models/Course.js";
import { cloudinary } from "../config/cloudinary.js";

// Upload Course Content
export const uploadCourseContent = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, description } = req.body;
    const fileUrl = req.file.path; // Cloudinary URL

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ error: "Course not found" });

    // Add new content
    course.content.push({ title, description, fileUrl });
    await course.save();

    res.status(201).json({ message: "Content uploaded successfully", course });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Course Content
export const getCourseContent = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ error: "Course not found" });

    res.status(200).json({ content: course.content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete Course Content
export const deleteCourseContent = async (req, res) => {
  try {
    const { courseId, contentId } = req.params;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ error: "Course not found" });

    // Find content index and remove it
    const contentIndex = course.content.findIndex(
      (item) => item._id.toString() === contentId
    );
    if (contentIndex === -1)
      return res.status(404).json({ error: "Content not found" });

    // Delete from Cloudinary
    const fileUrl = course.content[contentIndex].fileUrl;
    const publicId = fileUrl.split("/").pop().split(".")[0]; // Extract public ID
    await cloudinary.uploader.destroy(publicId);

    course.content.splice(contentIndex, 1);
    await course.save();

    res.status(200).json({ message: "Content deleted successfully", course });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
