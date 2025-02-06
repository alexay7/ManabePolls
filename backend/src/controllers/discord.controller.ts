import axios from "axios";
import {Router} from "express";
import jwt from "jsonwebtoken";
import qs from "querystring";
import {config} from "../config/config";

const discordController = Router();

discordController.post('/token', async (req, res) => {
    const data = qs.stringify({
        client_id: config.DISCORD_CLIENT_ID as string,
        client_secret: config.DISCORD_CLIENT_SECRET as string,
        grant_type: 'authorization_code',
        code: req.body.code,
        redirect_uri: config.FRONTEND_URL as string,
        scope: 'identify',
    });

    const tokenResponseData = await axios.request({
        url: 'https://discord.com/api/oauth2/token',
        method: 'POST',
        data: data,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    })
        .catch((err) => {
            console.error(err);
        });

    if (!tokenResponseData) {
        return res.status(400).json({message: 'Invalid token'});
    }

    const oauthData = await tokenResponseData.data;

    return res.json(oauthData);
});

discordController.get("/p/getMe", async (req, res) => {
    const authString = req.headers.authorization;

    if (!authString) {
        return res.status(401).json({message: 'Unauthorized'});
    }

    const me = await axios.get('https://discord.com/api/users/@me', {
        headers: {
            authorization: authString,
        },
    });

    if (me.status !== 200) {
        return false;
    }

    const response = await me.data;

    const accessToken = jwt.sign(response, config.SESSION_SECRET as string, {
        expiresIn: '1d',
    });

    res.json({accessToken, userInfo: response});
});

export default discordController;