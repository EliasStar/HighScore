import mongo from 'mongoose';

export default new mongo.Schema({
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