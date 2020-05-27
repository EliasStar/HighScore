import mongo, { Model, Document } from 'mongoose';
import performanceSchema from "./performance";

const sportSchema = new mongo.Schema({
    _id: {
        type: String,
        lowercase: true,
        required: true
    },
    name: {
        type: String,
        trim: true,
        required: true
    },
    unit: {
        type: String,
        trim: true,
        required: true
    },
    unitSymbol: {
        type: String,
        trim: true
    }
});

sportSchema.pre('validate', function (nxt) {
    this._id = (<string>this.get('name')).replace(/[^a-zA-Z0-9\.\-]+/g, '');

    if (this._id === "sport" || this._id === "sports") {
        throw new RangeError('Names containing the words "sport" and "sports" as their only alphanumeric parts are not allowed!');
    }

    nxt();
});

sportSchema.static('initSports', async function (this: Model<Document>) {
    const sports = await this.find().exec();

    sports.forEach(s => {
        mongo.model(s._id, performanceSchema, s._id);
    });
});

interface SportModel extends Model<Document> {
    initSports(): Promise<void>;
}

export default mongo.model<Document, SportModel>('Sport', sportSchema);