import {ViewController} from "../../iViewController";
import IntoCpsApp from "../../IntoCpsApp";
import {AppComponent} from "../app.component";

interface MyWindow extends Window {
    ng2app: AppComponent;
}

declare var window: MyWindow;

export class TrViewController extends ViewController {
    constructor(private view: HTMLDivElement) {
        super(view);
    }

    initialize() {
        $(this.view).css('height',0);
        IntoCpsApp.setTopName('Trace Simulation Results');
        window.ng2app.openTraceability();
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
export class TrFMUViewController extends ViewController {
    constructor(private view: HTMLDivElement) {
        super(view);
    }

    initialize() {
        $(this.view).css('height',0);
        IntoCpsApp.setTopName('Trace Requirements');
        window.ng2app.openFMUTraceability();
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