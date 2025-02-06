import {Types} from "mongoose";
import {pollService} from "./polls.service";
import {OptionType} from "../types/polls";
import axios from "axios";
import {config} from "../config/config";

const categories = {
    anime: {
        name: "Anime",
        role: "1167607983795085395"
    },
    manga: {
        name: "Manga",
        role: "1167607879667298354"
    },
    novel: {
        name: "Lectura",
        role: "1167607765590605905"
    },
    vn: {
        name: "VN",
        role: "1167608243254722580"
    },
    live: {
        name: "Live Actions",
        role: "1165379985171816478"
    }
};

export const discordService = {
    async sendMediaOfTheMonthMessage(category: "anime" | "manga" | "novel" | "vn" | "live", pollId: Types.ObjectId, optionId: Types.ObjectId) {
        const pollData = await pollService.findPollById(pollId);

        if (!pollData) {
            return -1;
        }

        const option = pollData[category].find((opt) => opt._id.equals(optionId)) as OptionType;

        if (!option) {
            return -1;
        }

        const message = `# Club de ${categories[category].name} - ${pollData.month} ${pollData.year}\nEl ganador de este mes es:\n## [${option.name}](${option.imageUrl})\n\n- Dificultad: ${option.difficulty}\n- Sinopsis: \n> ${option.description}\n\nQue tengan una gratificante experiencia y gracias por participar <:ayaya:1157825603597238372> \n\n<@&${categories[category].role}>`;

        const response = await axios.post(config.DISCORD_WEBHOOK_URL!, {
            content: message
        });

        return response.status;
    }
};

