import {ViewController} from "../../iViewController";
import IntoCpsApp from "../../IntoCpsApp";
import {AppComponent} from "../app.component";
import * as Path from 'path';

interface MyWindow extends Window {
    ng2app: AppComponent;
}

declare var window: MyWindow;

export class CoeViewController extends ViewController {
    constructor(private view: HTMLDivElement, private path:string) {
        super(view);
    }

    initialize() {
        $(this.view).css('height',0);
        let coeFolder = Path.join(this.path,"../");
        IntoCpsApp.setTopName(Path.basename(Path.join(coeFolder,"../"))+" > "+Path.basename(coeFolder));
        window.ng2app.openCOE(this.path);
    }

    deInitialize() {
        if (window.ng2app.navigationService.canNavigate()) {
            window.ng2app.closeAll();
            $(this.view).css('height',"calc(100% - 80px)");
            return true;
        }

        return false;
    }
}
