import {Component, Input, EventEmitter, Output, NgZone} from "@angular/core";
import {FORM_DIRECTIVES, REACTIVE_FORM_DIRECTIVES, Validators, FormArray, FormControl, FormGroup} from "@angular/forms";
import IntoCpsApp from "../../IntoCpsApp";
import {
    CoSimulationConfig, ICoSimAlgorithm, FixedStepAlgorithm,
    VariableStepAlgorithm, ZeroCrossingConstraint, BoundedDifferenceConstraint, SamplingRateConstraint,
    VariableStepConstraint
} from "../../intocps-configurations/CoSimulationConfig";
import {ScalarVariable, CausalityType, Instance, InstanceScalarPair} from "./models/Fmu";
import {ZeroCrossingComponent} from "./inputs/zero-crossing.component";
import {BoundedDifferenceComponent} from "./inputs/bounded-difference.component";
import {SamplingRateComponent} from "./inputs/sampling-rate.component";
import {doubleValidator, integerValidator, higherThanValidator, lowerThanValidator} from "../shared/validators";

@Component({
    selector: "coe-configuration",
    directives: [
        FORM_DIRECTIVES,
        REACTIVE_FORM_DIRECTIVES,
        ZeroCrossingComponent,
        BoundedDifferenceComponent,
        SamplingRateComponent
    ],
    templateUrl: "./angular2-app/coe/coe-configuration.component.html"
})
export class CoeConfigurationComponent {
    private _path:string;

    @Input()
    set path(path:string) {
        this._path = path;

        if (path)
            this.parseConfig();
    }
    get path():string {
        return this._path;
    }

    @Output()
    change = new EventEmitter<void>();

    form:FormGroup;
    algorithms:Array<ICoSimAlgorithm> = [];
    outputPorts:Array<InstanceScalarPair> = [];
    newConstraint: new (...args: any[]) => VariableStepConstraint;
    editing:boolean = false;

    private config:CoSimulationConfig;

    private algorithmConstructors = [
        FixedStepAlgorithm,
        VariableStepAlgorithm
    ];

    private constraintConstructors = [
        ZeroCrossingConstraint,
        BoundedDifferenceConstraint,
        SamplingRateConstraint
    ];

    constructor(private zone:NgZone) {

    }

    private parseConfig() {
        let project = IntoCpsApp.getInstance().getActiveProject();

        CoSimulationConfig
            .parse(this.path, project.getRootFilePath(), project.getFmusPath())
            .then(config => {
                this.zone.run(() => {
                    this.config = config;

                    this.form = new FormGroup({
                        startTime: new FormControl(this.config.startTime, [Validators.required, doubleValidator, lowerThanValidator("endTime")]),
                        endTime: new FormControl(this.config.endTime, [Validators.required, doubleValidator, higherThanValidator("startTime")])
                    });

                    // Create an array of the algorithm from the coe config and a new instance of all other algorithms
                    this.algorithms = this.algorithmConstructors
                        .map(constructor =>
                            config.algorithm instanceof constructor
                                ? config.algorithm
                                : new constructor()
                        );

                    this.config.multiModel.fmuInstances.forEach(instance => {
                        instance.fmu.scalarVariables
                            .filter(sv => sv.causality === CausalityType.Output)
                            .forEach(sv => {
                                this.outputPorts.push(this.config.multiModel.getInstanceScalarPair(instance.fmu.name, instance.name, sv.name))
                            });
                    });
                });
            });
    }

    onSubmit() {
        if (!this.editing) return;

        this.config.save()
            .then(() => this.change.emit(this.path));

        this.editing = false;
    }

    getOutputs(scalarVariables:Array<ScalarVariable>) {
        return scalarVariables.filter(variable => variable.causality === CausalityType.Output);
    }

    addConstraint() {
        if (!this.newConstraint) return;

        let algorithm = <VariableStepAlgorithm> this.config.algorithm;
        let constraint = new this.newConstraint();

        algorithm.constraints.push(constraint);
    }

    removeConstraint(constraint:VariableStepConstraint) {
        let algorithm = <VariableStepAlgorithm> this.config.algorithm;
        algorithm.constraints.splice(algorithm.constraints.indexOf(constraint), 1);
    }

    getAlgorithmName(algorithm:any) {
        if (algorithm === FixedStepAlgorithm || algorithm instanceof FixedStepAlgorithm)
            return "Fixed Step";

        if (algorithm === VariableStepAlgorithm || algorithm instanceof VariableStepAlgorithm)
            return "Variable Step";
    }

    getConstraintName(constraint:any) {
        if (constraint === ZeroCrossingConstraint || constraint instanceof ZeroCrossingConstraint)
            return "Zero Crossing";

        if (constraint === BoundedDifferenceConstraint || constraint instanceof BoundedDifferenceConstraint)
            return "Bounded Difference";

        if (constraint === SamplingRateConstraint || constraint instanceof SamplingRateConstraint)
            return "Sampling Rate";
    }

    isLivestreamChecked(instance:Instance, output:ScalarVariable) {
        let variables = this.config.livestream.get(instance);

        if (!variables) return false;

        return variables.indexOf(output) !== -1;
    }

    onLivestreamChange(enabled:boolean, instance:Instance, output:ScalarVariable) {
        let variables = this.config.livestream.get(instance);

        if (!variables) {
            variables = [];
            this.config.livestream.set(instance, variables);
        }

        if (enabled)
            variables.push(output);
        else {
            variables.splice(variables.indexOf(output), 1);

            if (variables.length == 0)
                this.config.livestream.delete(instance);
        }
    }
}