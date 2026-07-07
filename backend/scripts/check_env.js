require('dotenv').config();

console.log("Checking Environment Variables...");

const user = process.env.EMAIL_USER || '';
const pass = process.env.EMAIL_PASS || '';

console.log(`EMAIL_USER length: ${user.length}`);
console.log(`EMAIL_PASS length: ${pass.length}`);

if (user.trim() !== user) {
    console.log("WARNING: EMAIL_USER has leading/trailing spaces!");
    console.log(`Raw value: '${user}'`);
}

if (pass.trim() !== pass) {
    console.log("WARNING: EMAIL_PASS has leading/trailing spaces!");
    // Don't print the pass
}

if (pass.includes(' ')) {
    console.log("WARNING: EMAIL_PASS contains spaces in the middle!");
}

console.log("Finished check.");
