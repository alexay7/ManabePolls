import { User } from "../models/user.model";

export const userService = {
    incrementUserTickets: async (userId:string) => {
        return User.findOneAndUpdate({userId}, {$inc: {tickets: 1}}, {new: true, upsert:true});
    },
    decrementUserTickets: async (userId:string) => {
        const foundUser = await User.findOne({userId});

        if (!foundUser) {
            return User.create({userId,tickets:0});
        } else if(foundUser.tickets >= 1){
            return User.findOneAndUpdate({userId}, {$inc: {tickets: -1}}, {new: true});
        } else{
            return foundUser;
        }
    },
    getUserTickets: async (userId:string):Promise<number> => {
        const user = await User.findOne({userId});

        return user ? user.tickets : 0;
    }
};