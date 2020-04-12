import mongo from 'mongoose';

const score = new mongo.Schema({
    student: {
        type: String,
        required: true
    },
    score: {
        type: Number,
        required: true
    },
    teacher: {
        type: String
    },
    createdAt: {
        type: Date
    }
});

export default score;