import { contextBridge, ipcRenderer } from "electron";

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld("electron", {
  // EXPOSE ELECTRON BASED APIS TO REACT
  // MUST DEFINE IN electron-env.d.ts.
  sendNotification: ({ title, body }: { title: string; body: string }) => {
    new Notification(title, { body });
  },

  openExternal: (url: string) => ipcRenderer.send("open-external", url),

  // Mouse event control for smart click-through
  setIgnoreMouseEvents: (ignore: boolean) => 
    ipcRenderer.send("set-ignore-mouse-events", ignore),
});
