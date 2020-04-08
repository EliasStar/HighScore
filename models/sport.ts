import mongo from 'mongoose';

const sport = new mongo.Schema({
    name: {
        type: String,
        required: true
    },
    unitName: {
        type: String,
        required: true
    },
    unit: {
        type: String,
        required: true
    }
});

mongo.model('sports', sport);

export default sport;