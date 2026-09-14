const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Complaint = require('../model/Complaint');

dotenv.config({ quiet: true });

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const result = await Complaint.updateMany(
      { adminReply: { $exists: true, $nin: [''] } },
      { $set: { status: 'Resolved' } }
    );
    console.log(`resolved=${result.modifiedCount}`);
    await mongoose.disconnect();
  })
  .catch(async (error) => {
    console.error(error.message);
    await mongoose.disconnect();
    process.exitCode = 1;
  });
