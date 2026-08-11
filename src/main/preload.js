const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("shuffleboard", {
    version: "0.1.0",

    getStatus() {
        return {
            connected: true,
            machine: "AMZ-SHUFFLE-001"
        };
    }
});