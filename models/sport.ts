import mongo from 'mongoose';

const sport = new mongo.Schema({
    _id: {
        type: String,
        required: true
    },
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

mongo.model('sport', sport);

export default sport;