const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  version: () => '1.0.0',
});