import Inventory from "../models/gachainventory.model";

export const gachaService = {
    async getUserCharacters(user: string) {
        return Inventory.aggregate()
            .match({userId: user})
            .lookup({
                from: "characters",
                localField: "characterId",
                foreignField: "id",
                as: "character"
            })
            .unwind("$character")
            .sort({
                pinned: -1,
                rarity: -1,
                favourites: -1
            });
    },
    async doUserHaveCharacter(user: string, characterId: number) {
        return Inventory.findOne({userId: user, characterId});
    },
    async pinCharacter(user: string, characterId: number) {
        return Inventory.updateOne({userId: user, characterId}, {pinned: true}, {new: true});
    },
    async unpinCharacter(user: string, characterId: number) {
        return Inventory.updateOne({userId: user, characterId}, {pinned: false}, {new: true});
    },
    async yikesCharacter(user: string, characterId: number) {
        return Inventory.updateOne({userId: user, characterId}, {yikes: true}, {new: true});
    },
    async unyikesCharacter(user: string, characterId: number) {
        return Inventory.updateOne({userId: user, characterId}, {yikes: false}, {new: true});
    },
};