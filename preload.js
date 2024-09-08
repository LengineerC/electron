const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld("databaseApi",{
    getAll:(page,pageSize)=>ipcRenderer.invoke('getAll',{page,pageSize}),
    // insert:(name,age)=>ipcRenderer.invoke("insert",{name,age}),
    // delete:(id)=>ipcRenderer.invoke("delete",id),
    // updateAge:(id,age)=>ipcRenderer.invoke("updateAge",id,age),
    run:(query)=>ipcRenderer.invoke("run",query),
});

contextBridge.exposeInMainWorld("portApi",{
    send:(op,content)=>ipcRenderer.invoke('send',op,content),
});