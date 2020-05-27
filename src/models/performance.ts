import mongo from 'mongoose';

export default new mongo.Schema({
    student: {
        type: String,
        trim: true,
        required: true,
        match: /^\d{14}$/
    },
    score: {
        type: Number,
        required: true
    },
    teacher: {
        type: String,
        trim: true,
        required: true,
        match: /^[A-Z][a-z]{2}[A-Z]$/
    },
    expiresAt: {
        type: Date,
        required: true,
        default: new Date(new Date().getFullYear(), 7, 1),
        expires: 0
    }
});