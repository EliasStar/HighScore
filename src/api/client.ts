import http2 from "http2";

export default http2
    .connect("https://www.dachsberg.at:443", () => console.log("[Database] Connected to Dachsberg."))
    .on("error", err => console.error("[Database] Error from client: " + err));