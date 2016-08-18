import {Component, Input} from "@angular/core";
import {DseOverviewComponent} from "./dse-overview.component";
import IntoCpsApp from "../../IntoCpsApp";
import {PanelComponent} from "../shared/panel.component";

@Component({
    selector: "dse-page",
    directives: [
        PanelComponent,
        DseOverviewComponent
    ],
    templateUrl: "./angular2-app/dse/dse-page.component.html",
})
export class DsePageComponent {
    @Input()
    path:string;
}