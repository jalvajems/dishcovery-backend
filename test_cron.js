const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/dishcovery').then(async () => {
    const db = mongoose.connection;
    const workshops = await db.collection('workshops').find({
        mode: 'OFFLINE',
        status: { $in: ['APPROVED', 'UPCOMING'] }
    }).toArray();

    const now = new Date();
    console.log('Current Date Node:', now);
    console.log('Found workshops:', workshops.length);

    workshops.forEach(w => {
        const workshopDate = new Date(w.date);
        const [hours, minutes] = w.startTime.split(':').map(Number);
        workshopDate.setHours(hours, minutes, 0, 0);

        const oneDayAfterStart = new Date(workshopDate.getTime() + 24 * 60 * 60 * 1000);
        const isExpired = now > oneDayAfterStart;

        console.log(`Workshop: ${w._id}`);
        console.log(`  Title: ${w.title}`);
        console.log(`  Start Time: ${workshopDate}`);
        console.log(`  One Day After: ${oneDayAfterStart}`);
        console.log(`  Is Expired: ${isExpired}`);
    });

    process.exit(0);
});
