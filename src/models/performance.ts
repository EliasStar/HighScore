import mongo from 'mongoose';

export default new mongo.Schema({
    _id: {
        type: mongo.Types.ObjectId,
        alias: 'id',
        required: true,
        default: new mongo.Types.ObjectId()
    },
    student: {
        type: String,
        trim: true,
        required: true,
        match: /^\d{14}$/gi
    },
    score: {
        type: Number,
        required: true
    },
    teacher: {
        type: String,
        trim: true,
        required: true,
        match: /^[A-Z][a-z]{2}[A-Z]$/g
    },
    expiresAt: {
        type: Date,
        required: true,
        default: new Date(new Date().getFullYear(), 7, 1),
        expires: 0
    }
});