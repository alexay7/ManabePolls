import {Schema} from "mongoose";
import {gachaDb} from "../db";

const gachaInventorySchema = new Schema({
    _id: {
        type: Schema.Types.ObjectId,
        required: true,
        auto: true
    },
    userId: {
        type: String,
        required: true
    },
    characterId: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    pinned: {
        type: Boolean,
        default: false
    },
    yikes: {
        type: Boolean,
        default: false
    }
});

const Inventory = gachaDb.model("inventory", gachaInventorySchema);

// Index for user and characterId
Inventory.collection.createIndex({userId: 1, characterId: 1}, {unique: true});

export default Inventory;