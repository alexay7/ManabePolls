import path from "path";
import react from "@vitejs/plugin-react";
import {defineConfig, loadEnv} from "vite";
import svgr from "vite-plugin-svgr";

export default ({mode}: { mode: string }
) => {
    process.env = {...process.env, ...loadEnv(mode, process.cwd())};

    return defineConfig({
        plugins: [react(), svgr()],
        resolve: {
            alias: {
                "@": path.resolve(__dirname, "./src"),
            },
        },
        server: {
            host: true,
            port: 3000,
            watch: {
                usePolling: true
            },
            strictPort: true,
            origin: "https://polls.manabe.es",
            proxy: {
                "/api": {
                    target: process.env.VITE_APP_API_URL,
                    changeOrigin: true,
                    secure: false,
                    rewrite: (path) => path.replace(/^\/api/, ""),
                }
            }
        }
    });
};
