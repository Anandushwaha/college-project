import axios from "axios";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

/**
 * Search jobs from multiple job APIs
 */
export const searchJobs = async (req, res) => {
  try {
    const { title, location, company } = req.body;
    console.log(title, location, company);

    if (!title) {
      return res.status(400).json({ error: "Job title is required" });
    }

    // Fetch jobs from all four APIs in parallel
    const [remotiveJobs, adzunaJobs, arbeitNowJobs, joobleJobs] =
      await Promise.allSettled([
        fetchRemotiveJobs(title, location, company),
        fetchAdzunaJobs(title, location, company),
        fetchArbeitNowJobs(company),
        fetchJoobleJobs(title, location, company),
      ]);

    // Collect only successful responses
    const allJobs = [
      ...(remotiveJobs.status === "fulfilled" ? remotiveJobs.value : []),
      ...(adzunaJobs.status === "fulfilled" ? adzunaJobs.value : []),
      ...(arbeitNowJobs.status === "fulfilled" ? arbeitNowJobs.value : []),
      ...(joobleJobs.status === "fulfilled" ? joobleJobs.value : []),
    ];

    res.status(200).json({ jobs: allJobs });
  } catch (error) {
    console.error("Error searching jobs:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * Fetch jobs from Remotive API
 */
const fetchRemotiveJobs = async (title, location, company) => {
  console.log(title, location, company);
  try {
    const url = `http://remotive.io/api/remote-jobs?search=${encodeURIComponent(
      title
    )}`;

    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept: "application/json",
      },
    });

    // Filter jobs based on both location and company
    const filteredJobs = response.data.jobs.filter((job) => {
      const isLocationMatch =
        !location ||
        job.candidate_required_location
          .toLowerCase()
          .includes(location.toLowerCase()) ||
        job.candidate_required_location === "Anywhere"; // Include remote jobs

      const isCompanyMatch =
        !company ||
        job.company_name.toLowerCase().includes(company.toLowerCase());

      return isLocationMatch && isCompanyMatch;
    });

    return filteredJobs.map((job) => ({
      title: job.title,
      company: job.company_name,
      location: job.candidate_required_location || "Remote",
      url: job.url,
      source: "Remotive",
    }));
  } catch (error) {
    console.error("Remotive API Error:", error.message);
    return [];
  }
};

/**
 * Fetch jobs from Adzuna API
 */
const fetchAdzunaJobs = async (title, location = "India", company) => {
  try {
    const url = `https://api.adzuna.com/v1/api/jobs/in/search/1?app_id=${
      process.env.ADZUNA_APP_ID
    }&app_key=${process.env.ADZUNA_APP_KEY}&what=${encodeURIComponent(
      title
    )}&where=${encodeURIComponent(location)}`;

    const { data } = await axios.get(url);

    // Filter based on both company and location
    return (
      data.results
        ?.map((job) => {
          const isLocationMatch =
            !location ||
            job.location.display_name
              .toLowerCase()
              .includes(location.toLowerCase());
          const isCompanyMatch =
            !company ||
            job.company.display_name
              .toLowerCase()
              .includes(company.toLowerCase());

          if (isLocationMatch && isCompanyMatch) {
            return {
              title: job.title,
              company: job.company?.display_name || "Unknown",
              location: job.location?.display_name || location,
              url: job.redirect_url,
              source: "Adzuna",
            };
          }
          return null;
        })
        ?.filter((job) => job !== null) || []
    );
  } catch (error) {
    console.error("Adzuna API Error:", error.message);
    return [];
  }
};

/**
 * Fetch jobs from ArbeitNow API
 */
const fetchArbeitNowJobs = async (company) => {
  try {
    const url = "https://www.arbeitnow.com/api/job-board-api";
    const { data } = await axios.get(url);

    // Filter jobs based on company
    return (
      data.jobs
        ?.map((job) => {
          if (
            !company ||
            job.company_name.toLowerCase().includes(company.toLowerCase())
          ) {
            return {
              title: job.title,
              company: job.company_name || "Unknown",
              location: job.location || "Remote",
              url: job.url,
              source: "ArbeitNow",
            };
          }
          return null;
        })
        ?.filter((job) => job !== null) || []
    );
  } catch (error) {
    console.error("ArbeitNow API Error:", error.message);
    return [];
  }
};

/**
 * Fetch jobs from Jooble API
 */
const fetchJoobleJobs = async (title, location = "Remote", company) => {
  try {
    const url = `https://jooble.org/api/${process.env.JOOBLE_API_KEY}`;
    const { data } = await axios.post(url, {
      keywords: title,
      location,
    });

    // Filter based on company
    return (
      data.jobs
        ?.map((job) => {
          const isCompanyMatch =
            !company ||
            job.company.toLowerCase().includes(company.toLowerCase());

          if (isCompanyMatch) {
            return {
              title: job.title,
              company: job.company || "Unknown",
              location: job.location || "Remote",
              url: job.link,
              source: "Jooble",
            };
          }
          return null;
        })
        ?.filter((job) => job !== null) || []
    );
  } catch (error) {
    console.error("Jooble API Error:", error.message);
    return [];
  }
};
