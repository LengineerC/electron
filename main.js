const { app, BrowserWindow, ipcMain } = require('electron/main');
const path=require('path');
const DatabaseManager=require("./src/db/DatabaseManager.js");
const SerialPortClient=require("./src/serial_ports/serial_port.client.js");

const db=new DatabaseManager();
const client=new SerialPortClient();

async function handleGetAll(_,{page,pageSize}){
    const res=await db.selectAll(page,pageSize);
    return res;
}
// async function handleInsert(_,{name,age}) {
//     const res=await db.insert(name,age);
    
//     return res["last_insert_rowid()"];
// }
// async function handleDelete(_,id) {
//     await db.delete(id);
// }
// async function handleUpdateAge(_,id,age) {
//     await db.updateAge(id,age);
// }

async function handleRun(_,query){
    const res=db.run(query);
    return res;
}

async function handleSend(_,op,content) {
    const updateNum=await client.sendBuffer(op,content);
    console.log(updateNum);
    
    return updateNum;
}

const createWindow = () => {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        resizable:false,
        webPreferences:{
            preload:path.join(__dirname,"preload.js"),
        }
    });

    db.connect("test.db");

    ipcMain.handle("getAll",handleGetAll);
    // ipcMain.handle("insert",handleInsert);
    // ipcMain.handle("delete",handleDelete);
    // ipcMain.handle("updateAge",handleUpdateAge);
    ipcMain.handle("run",handleRun);

    ipcMain.handle('send',handleSend);

    win.loadFile('./src/pages/index.html');
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });

    client.openClientPort();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
    db.close();
});