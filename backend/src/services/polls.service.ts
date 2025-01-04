import { Types } from "mongoose";
import { Poll } from "../models/poll.model";
import { OptionType, PollWinnerVoters } from "../types/polls";

export const pollService = {
    async createPoll(createPoll:{month:string,year:string}) {
        return Poll.create(createPoll);
    },
    async getPolls() {
        return Poll.find();
    },
    async addOptionToPoll(pollId:Types.ObjectId,category:string,option:Omit<OptionType,"_id">) {
        return Poll.findByIdAndUpdate(pollId,{
            $push:{
                [category]:option
            }
        },{new:true});
    },
    async deleteOptionFromPoll(pollId:Types.ObjectId,category:string,optionName:string) {
        return Poll.findByIdAndUpdate(pollId,{
            $pull:{
                [category]:{
                    name:optionName
                }
            }
        },{new:true});
    },
    getActivePolls() {
        return Poll.find({active:true});
    },
    activatePoll(pollId:Types.ObjectId) {
        return Poll.findByIdAndUpdate(pollId,{
            active:true
        },{new:true});
    },
    endPoll(pollId:Types.ObjectId,voters:PollWinnerVoters) {
        return Poll.findByIdAndUpdate(pollId,{
            active:false,
            ended:true,
            voters
        },{new:true});
    },
    findPollById(pollId:Types.ObjectId) {
        return Poll.findById(pollId);
    },
    getLastPoll(){
        return Poll.find({ended:true}).sort({_id:-1}).limit(1);
    }
};