///<reference path="../../typings/browser/ambient/jquery/index.d.ts"/>
/// <reference path="../../node_modules/typescript/lib/lib.es6.d.ts" />

import {IntoCpsApp} from  "../IntoCpsApp"
import {SettingKeys} from "../settings/SettingKeys";


import Path = require('path');
import fs = require('fs');

/*window.onload = function () {
    
};*/

function launchProjectExplorer() {
    let remote = require("electron").remote;
    let dialog = remote.dialog;
    let dialogResult: string[] = dialog.showOpenDialog({ properties: ["openDirectory", "createDirectory"] });
    if (dialogResult != undefined) {

        var p: HTMLInputElement = <HTMLInputElement>document.getElementById("projectRootPathText");
        p.value = dialogResult[0];
        //       this.app.createProject("my project",this.projectRootPath.value);
    }


}




function openFromGit() {

    var p: HTMLInputElement = <HTMLInputElement>document.getElementById("basic-url");
    var dest: HTMLInputElement = <HTMLInputElement>document.getElementById("projectRootPathText");

    document.getElementById('openSpinner').style.display = "block";
    document.getElementById('container').style.display = "none";

    var progress = document.getElementById('progress');
    var progressBar = document.getElementById('progress-bar');

    fetchProjectThroughGit(p.value, dest.value, (output:string) => {
        var percentage = parsePercentage(output);

        if (percentage) {
            progressBar.style.width = percentage;
            progressBar.innerHTML = percentage;
        }

        progress.innerHTML = output.split("\n").pop();
    })
        .then(code => window.top.close());
}

export function parsePercentage(data:string):string {
    var newest = data.split("\n").pop();

    if (newest.indexOf("Receiving objects:") !== -1) {
        // example: Receiving objects:   1% (12/834), 1.89 MiB | 609.00 KiB/s

        // Pull out percentage value
        return newest.split("%")[0].split(" ").pop() + '%';
    }
}

export function fetchProjectThroughGit(url: string, targetFolder: string, updates: (data: string) => void) {
    return new Promise((resolve, reject) => {
        var spawn = require('child_process').spawn;

        let childCwd = targetFolder;

        var name = url.substring(url.lastIndexOf('/') + 1);

        let index = name.lastIndexOf('.git');
        if (index > 0) {
            name = name.substring(0, index);
        }

        let repoPath = Path.join(childCwd, name);
        let repoProjectFile = Path.join(repoPath, ".project.json");

        var repoExists = false;
        try {
            fs.accessSync(repoProjectFile, fs.constants.R_OK);
            repoExists = true;

        } catch (e) {

        }

        var mkdirp = require('mkdirp');
        mkdirp.sync(childCwd);

        var child: any = null;

        if (!repoExists) {
            child = spawn('git', ['clone',"--depth","1", "--progress", url], {
                detached: false,
                cwd: childCwd
            });
        } else {
            child = spawn('git', ['pull',"--depth","1", "--progress"], {
                detached: false,
                cwd: repoPath
            });
        }

        child.stdout.on('data', (data: any) => {
            if (updates) updates(data.toString());
        });

        child.stderr.on('data', (data: any) => {
            if (updates) updates(data.toString());
        });

        child.on('close', function (code: any) {
            console.log('closing code: ' + code);
            //Here you can get the exit code of the script
        });

        child.on('exit', function (code: any) {
            console.log('exit code: ' + code);
            //Here you can get the exit code of the script


            let p = IntoCpsApp.getInstance().loadProject(repoProjectFile);
            IntoCpsApp.getInstance().setActiveProject(p);

            if (code === 0)
                resolve(code);
            else
                reject(code);
        });
        //    var fork = require("child_process").fork,
        //   child = fork(__dirname + "/start-coe.js");
    });
}
