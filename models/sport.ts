import mongo from 'mongoose';

const sport = new mongo.Schema({
    _id: {
        type: String,
        alias: 'id',
        lowercase: true,
        required: true
    },
    name: {
        type: String,
        trim: true,
        required: true
    },
    unitName: {
        type: String,
        //enum: ['Zeit', 'Punkte', 'Strecke', 'Anzahl', 'Kraft'],
        trim: true,
        required: true
    },
    unit: {
        type: String,
        //enum: ['s', 'min', 'h', 'x', 'km', 'm', 'cm', 'N']
        trim: true
    }
});

sport.pre('validate', function (nxt) {
    this._id = (<string>this.get('name')).replace(/[^a-zA-Z0-9\.\-]+/g, '');
    nxt();
});

export default mongo.model('Sport', sport);