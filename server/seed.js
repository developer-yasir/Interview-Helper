const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const Job = require('./models/Job');
const User = require('./models/User');
const Profile = require('./models/Profile');

dotenv.config();

const demoUsers = [
    { name: 'Sarah Engineer', email: 'sarah@example.com', password: 'password123', role: 'Frontend Developer', bio: "Passionate about building responsive UIs." },
    { name: 'Alex Manager', email: 'alex@example.com', password: 'password123', role: 'Product Manager', bio: "Focused on user-centric product strategy." },
    { name: 'David Backend', email: 'david@example.com', password: 'password123', role: 'Backend Developer', bio: "Scalable systems enthusiast." },
    { name: 'Emily Design', email: 'emily@example.com', password: 'password123', role: 'UX Designer', bio: "Designing intuitive user experiences." },
    { name: 'Michael Intern', email: 'michael@example.com', password: 'password123', role: 'Software Intern', bio: "Eager to learn full-stack development." },
];

const sampleJobs = [
    {
        company: "Google",
        position: "Senior Frontend Engineer",
        status: "Applied",
        notes: "Referral from Sarah. Focus on React performance.",
        jobLink: "https://careers.google.com/jobs/results/"
    },
    {
        company: "Meta",
        position: "Full Stack Developer",
        status: "Interviewing",
        notes: "Recruiter screen passed. Technical round scheduled for next Tuesday.",
        jobLink: "https://www.metacareers.com/"
    },
    {
        company: "Netflix",
        position: "UI Engineer",
        status: "Offer",
        notes: "Offer received! Negotiating salary. Deadline: Jan 30.",
        jobLink: "https://jobs.netflix.com/"
    },
    {
        company: "Amazon",
        position: "SDE II",
        status: "Rejected",
        notes: "Failed system design round. Need to prefer for scaling questions next time.",
        jobLink: "https://www.amazon.jobs/"
    },
    {
        company: "Spotify",
        position: "Web Developer",
        status: "Applied",
        notes: "Love the product. Applied via LinkedIn.",
        jobLink: "https://www.lifeatspotify.com/"
    }
];

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/interviewhelper');
        console.log('MongoDB Connected');

        // Clear existing data
        await Job.deleteMany({});
        await User.deleteMany({});
        await Profile.deleteMany({});
        console.log('Cleared existing jobs, users, and profiles');

        // Insert Users, Profiles, and Jobs
        for (const u of demoUsers) {
            // 1. Hash Password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(u.password, salt);

            // 2. Create User
            const user = await User.create({
                name: u.name,
                email: u.email,
                password: hashedPassword,
                role: 'User'
            });

            // 3. Create Linked Profile
            await Profile.create({
                user: user._id,
                name: u.name,
                email: u.email,
                jobTitle: u.role,
                bio: u.bio,
                skills: ['JavaScript', 'React', 'Node.js'], // Default skills
                experience: [],
                education: []
            });

            // 4. Create Jobs for this User (Clone sample jobs)
            const userJobs = sampleJobs.map(job => ({
                ...job,
                user: user._id, // Assign to this user
                status: ['Applied', 'Interviewing', 'Offer', 'Rejected'][Math.floor(Math.random() * 4)] // Randomize status for variety
            }));

            await Job.insertMany(userJobs);

            console.log(`Created user: ${u.email} with ${userJobs.length} jobs`);
        }

        console.log(`✅ Successfully seeded database!`);

        process.exit();
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seed();
