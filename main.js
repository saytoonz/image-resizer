const path = require('path')
const os = require('os')
const fs = require('fs')
const resizeImg = require('resize-img')
const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron')


process.env.NODE_ENV = 'production'


const isDev = process.env.NODE_ENV !== 'production'
const isMac = process.platform === 'darwin';
let mainWidndow;

//Create the main window
const createMainWindow = () => {
     mainWidndow = new BrowserWindow({
        title: "Image Resizer",
        width: isDev ? 900 : 500,
        height: 600,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js'),
        }
    })

    //Open development tools if in development mode
    if (isDev) mainWidndow.webContents.openDevTools()

    mainWidndow.loadFile(path.join(__dirname, './renderer/index.html'))
}
// Create about window
const createAboutWindow = () => {
    const window = new BrowserWindow({
        title: "About",
        width: 300,
        height: 300,
    })

    window.loadFile(path.join(__dirname, './renderer/about.html'))
}

// App is ready
app.whenReady().then(() => {
    createMainWindow()

    //Implement Menu
    const mainMenu = Menu.buildFromTemplate(menu)
    Menu.setApplicationMenu(mainMenu)

    //Remove main menu from memory on close
    mainWidndow.on('close', () => (mainWidow = null))

    // Create window again when it lost
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createMainWindow()
        }
    })
})


//Menu templates
const menu = [
    ...(isMac ? [{
        label: app.name,
        submenu: [
            {
                label: 'About',
                click: createAboutWindow,
            },
        ]
    }] : []),
    {
        role: 'filemenu',
        // label: 'File',
        // submenu: [
        //     {
        //         label: 'Quit',
        //         click: () => app.quit(),
        //         accelerator: 'CmdOrCtrl+W',
        //     }
        // ]
    },
    ...(isMac ? [] : [{
        label: 'Help',
        submenu: [
            {
                label: 'About',
                click: createAboutWindow,
            }
        ]
    }]),
]


// Respond to ipcRender image:resize event
ipcMain.on('image:resize', (e, options) => {
    options.dest = path.join(os.homedir(), 'imageresizer');
    resizeImage(options);
})

async function resizeImage({ imagePath, width, height, dest }) {
    try {
        const newPath = await resizeImg(fs.readFileSync(imagePath), {
            width: +width,
            height: +height,
        })

        // Create file name
        const filename  =  path.basename(imagePath)

        //Create destination directory if it doesn't exist
        if (!fs.existsSync(dest)) { 
            fs.mkdirSync(dest)
        }

        // Write file to destination
        fs.writeFileSync(path.join(dest, filename), newPath)

        //Send success message to render
        mainWidndow.webContents.send('image:done')

        // open destination directory
        shell.openPath(dest)

    } catch (error) {
        console.log(error);
    }
}


app.on('window-all-closed', () => {
    if (!isMac) {
        app.quit()
    }
})