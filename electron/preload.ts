import { contextBridge, ipcRenderer } from "electron";

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld("electron", {
  // EXPOSE ELECTRON BASED APIS TO REACT
  // MUST DEFINE IN electron-env.d.ts.
  setClickThrough: (ignore: boolean) => ipcRenderer.send("set-click-through", ignore),
});
