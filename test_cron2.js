const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/dishcovery').then(async () => {
    const db = mongoose.connection;
    const workshop = await db.collection('workshops').findOne({ _id: new mongoose.Types.ObjectId('699d61c4d707e867f25aaa97') });

    console.log('Workshop Status:', workshop.status);
    console.log('Cancellation Reason:', workshop.cancellationReason);
    process.exit(0);
});
