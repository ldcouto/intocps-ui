import * as Path from 'path';
import * as fs from 'fs';


import {ISettingsValues} from "./settings/ISettingsValues";
import {Settings} from "./settings/settings";
import {IProject} from "./proj/IProject";
import {Project} from "./proj/Project";
import {IntoCpsAppEvents} from "./IntoCpsAppEvents";
import {SettingKeys} from "./settings//SettingKeys";
import {EventEmitter} from "events";
import {trManager} from "./traceability/trManager"
import {Utilities} from "./utilities"

// constants
let topBarNameId: string = "activeTabTitle";

export default class IntoCpsApp extends EventEmitter {
    app: Electron.App;
    platform: String
    window: Electron.BrowserWindow;
    trmanager:trManager;

    settings: Settings;

    activeProject: IProject = null;
    isquitting = false;

    constructor(app: Electron.App, processPlatform: String) {
        super();
        this.app = app;
        this.platform = processPlatform;

        const intoCpsAppFolder = this.createAppFolderRoot(app);
        this.createDirectoryStructure(intoCpsAppFolder);
        // Set calculated default values
        let defaultValues = SettingKeys.DEFAULT_VALUES;
        let projRoot = Utilities.getSystemPlatform() == "windows" ? this.app.getPath('documents') : this.app.getPath('home');
        let defaultProjectFolderPath = Path.join(projRoot, "into-cps-projects");
        defaultValues[SettingKeys.INSTALL_TMP_DIR] = Path.join(defaultProjectFolderPath, "install_downloads");
        defaultValues[SettingKeys.INSTALL_DIR] = Path.join(defaultProjectFolderPath, "install");
        defaultValues[SettingKeys.DEFAULT_PROJECTS_FOLDER_PATH] = defaultProjectFolderPath;

        this.settings = new Settings(app, intoCpsAppFolder);


        this.settings.load();
        // fill-in default values for yet unset values
        for (var key in defaultValues) {
            if (this.settings.getSetting(key) == null) {
                let value: any = SettingKeys.DEFAULT_VALUES[key];
                this.settings.setSetting(key, value);
            }
        }
        this.settings.save();

        //Check for development mode and adjust settings to reflect this
        if (this.settings.getValue(SettingKeys.DEVELOPMENT_MODE)) {
            this.settings.setValue(SettingKeys.UPDATE_SITE, this.settings.getValue(SettingKeys.DEV_UPDATE_SITE));
            this.settings.setValue(SettingKeys.EXAMPLE_REPO, this.settings.getValue(SettingKeys.DEV_EXAMPLE_REPO));
        }

        this.trmanager = new trManager(this.settings.setSetting.bind(this.settings),this.getSettings().getValue(SettingKeys.ENABLE_TRACEABILITY));
        let activeProjectPath = this.settings.getSetting(SettingKeys.ACTIVE_PROJECT);
        if (activeProjectPath) {
            try {
                if (!fs.accessSync(activeProjectPath, fs.constants.R_OK)) {

                    this.activeProject = this.loadProject(activeProjectPath);
                } else {
                    console.error("Could not read the active project path from settings: " + activeProjectPath);
                }
            } catch (e) {
                console.warn(e);
                console.warn("Unable to set active project from settings: " + activeProjectPath);
            }
        }
    }

    public setWindow(win: Electron.BrowserWindow) {
        this.window = win;
    }

    public recordTrace(jsonObj: Object){
        this.trmanager.recordTrace(jsonObj);
    }


    private createAppFolderRoot(app: Electron.App): string {
        // Create intoCpsApp folder
        const userPath = function () {
            if (app.getPath("exe").indexOf("electron-prebuilt") > -1) {

                console.log("Dev-mode: Using " + __dirname + " as user data path.");
                return __dirname;
            }
            else {
                let path = app.getPath("userData");
                console.log(`Npm start user data path: ${path}`);
                return path;
            }
        } ();

        return Path.normalize(userPath + "/intoCpsApp");
    }

    private createDirectoryStructure(path: string) {
        try {
            fs.mkdirSync(path);
        } catch (e) {
            // the path probably already existed
        }
    }

    public getSettings(): Settings {
        return this.settings;
    }

    public getActiveProject(): IProject {
        return this.activeProject;
    }

    public setActiveProject(project: IProject) {

        if (project == null)
            return;

        this.activeProject = project;

        // Fire an event to inform all controlls on main window that the project has changed
        this.fireEvent(IntoCpsAppEvents.PROJECT_CHANGED);


        this.settings.setSetting(SettingKeys.ACTIVE_PROJECT, project.getProjectConfigFilePath());
        this.settings.save();
    }


    // Fires an ipc event using the window webContent if defined
    private fireEvent(event: string) {
        if (this.window != undefined) {
            // Fire an event to inform all controlls on main window that the project has changed
            this.window.webContents.send(IntoCpsAppEvents.PROJECT_CHANGED);
            console.info("fire event: " + event);
        }
        this.emit(IntoCpsAppEvents.PROJECT_CHANGED);
    }


    public createProject(name: string, path: string) {
        let project = new Project(name, path, Path.normalize(path + "/.project.json"));
        project.save();
        this.setActiveProject(project);
        this.trmanager.changeDataBase(Path.dirname(path), this.settings.getValue(SettingKeys.INSTALL_DIR), this.settings.getValue(SettingKeys.INSTALL_TMP_DIR));
    }

    loadProject(path: string): IProject {
        console.info("Loading project from: " + path); 
        let config = Path.normalize(path);
        let content = fs.readFileSync(config, "utf8");
        // TODO load configuration containers and config files
        let project = SerializationHelper.toInstance(new Project("", "", ""), content.toString());
        project.configPath = path;
        project.rootPath = Path.dirname(path);
        project.save() // create all the project folders, in case they don't exist.
        this.trmanager.changeDataBase(Path.dirname(path), this.settings.getValue(SettingKeys.INSTALL_DIR), this.settings.getValue(SettingKeys.INSTALL_TMP_DIR));
        return project;
    }


    //get the global instance
    public static getInstance(): IntoCpsApp {
        let intoApp:IntoCpsApp = null;
        let remote = require("electron").remote;
        if (remote){
            intoApp = remote.getGlobal("intoCpsApp");
        }else{
            intoApp = global.intoCpsApp;
        }
        return intoApp;
    }

    // change topbar title
    public static setTopName(s: string) {
        var mainName = (<HTMLSpanElement>document.getElementById(topBarNameId));
        mainName.innerText = s;
    };


}

// http://stackoverflow.com/questions/29758765/json-to-typescript-class-instance
class SerializationHelper {
    static toInstance<T>(obj: T, json: string): T {
        let jsonObj = JSON.parse(json);

        if (typeof (<any>obj)["fromJSON"] === "function") {
            (<any>obj)["fromJSON"](jsonObj);
        }
        else {
            for (let propName in jsonObj) {
                (<any>obj)[propName] = jsonObj[propName];
            }
        }

        return obj;
    }
}


export {IntoCpsApp}
