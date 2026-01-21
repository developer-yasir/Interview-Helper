const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const path = require('path');

const adapter = new FileSync(path.join(__dirname, 'db.json'));
const db = low(adapter);

// Set defaults if empty
db.defaults({
    jobs: [], profile: {
        name: 'Guest User',
        email: '',
        phone: '',
        jobTitle: '',
        bio: '',
        socialLinks: { linkedin: '', github: '', portfolio: '' },
        skills: [],
        experience: [],
        education: []
    }
}).write();


module.exports = db;
