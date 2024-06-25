import { defineConfig } from "@solidjs/start/config";

export default defineConfig({
    vite: {
        base: "/localchat"
    },
    server: {
        baseURL: "/localchat",
    }
});