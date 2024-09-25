import mongoose, { Schema } from "mongoose";
import { OptionType, PollType } from "../types/polls";

const linkSchema = new Schema<OptionType["links"][0]>({
    name:{
        type:String,
        required:true
    },
    url:{
        type:String,
        required:true
    }
}, {_id:false});

const optionSchema = new Schema<OptionType>({
    name:{
        type:String,
        required:true
    },
    imageUrl:{
        type:String,
        required:true
    },
    description: {
        type:String,
        required:true
    },
    links:[linkSchema],
    difficulty:{
        type:String,
        required:false
    },
    proposer:{
        type:String,
        required:true
    }
});

const pollSchema = new Schema<PollType>({
    month: {
        type: String,
        required: true
    },
    year:{
        type:String,
        required:true
    },
    anime: {
        type: [optionSchema],
        default: []
    },
    manga: {
        type: [optionSchema],
        default: []
    },
    novel: {
        type: [optionSchema],
        default: []
    },
    vn: {
        type: [optionSchema],
        default: []
    },
    live: {
        type: [optionSchema],
        default: []
    },
    active:{
        type:Boolean,
        default:false
    },
    ended:{
        type:Boolean,
        default:false
    }
});

export const Poll = mongoose.model('Poll', pollSchema);

pollSchema.index({month:1,year:1},{unique:true});