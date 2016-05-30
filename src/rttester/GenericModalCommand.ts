
export interface Command {
    title: string;
    command: string[];
    env?: { [key: string]: string; };
}

export function initialize(cmd: Command): void {
    document.getElementById("modalTitle").innerText = cmd.title;
    var hRunButton: HTMLButtonElement = <HTMLButtonElement>document.getElementById("modalRun");
    var hAbortButton: HTMLButtonElement = <HTMLButtonElement>document.getElementById("modalAbort");
    var hCloseButton: HTMLButtonElement = <HTMLButtonElement>document.getElementById("modalClose");
    var hOutputText: HTMLTextAreaElement = <HTMLTextAreaElement>document.getElementById("modalOutputText");
    
    hRunButton.addEventListener("click", function (event: Event) {
        hRunButton.style.display = 'none';
        hCloseButton.style.display = 'none';
        hAbortButton.style.display = "initial";
        document.getElementById("modalOutput").style.display = "initial";
        
        const spawn = require('child_process').spawn;
        var options: any = {};
        if (cmd.env != undefined)
            options.env = cmd.env;
        const process = spawn(cmd.command[0], cmd.command.slice(1), options);
        process.stdout.on('data', (data: string) => {
            hOutputText.textContent += data + "\n";
            hOutputText.scrollTop = hOutputText.scrollHeight;
        });
        process.stderr.on('data', (data: string) => {
            hOutputText.textContent += data + "\n";
            hOutputText.scrollTop = hOutputText.scrollHeight;
        });
        process.on('close', (code: number) => {
            document.getElementById("modalRUN").style.display = "none";
            document.getElementById(code == 0 ? "modalOK" : "modalFAIL").style.display = "block";
            hCloseButton.style.display = 'initial';
            hAbortButton.style.display = 'none';
        });
        hAbortButton.addEventListener("click", function (event: Event) {
            process.kill();
        });
        hAbortButton.style.display = 'initial';
    });
}

