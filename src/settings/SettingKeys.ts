// Module contaiing valid setting keys
export namespace SettingKeys {
    export var DEVELOPMENT_MODE = "development_mode";
    export var ACTIVE_PROJECT = "active_project";
    export var INSTALL_DIR = "install_dir";
    export var INSTALL_TMP_DIR = "install_tmp_dir";
    export var COE_URL = "coe_host_url";
    export var TRACE_DAEMON_PORT = "traceability_daemon_port";
    export var COE_DEBUG_ENABLED = "coe_debug_enabled";
    export var COE_REMOTE_HOST = "coe_remote_host";
    export var COE_JAR_PATH = "coe_jar_path";
    export var RTTESTER_INSTALL_DIR: string = "RT-Tester Installation Path";
    export var RTTESTER_MBT_INSTALL_DIR: string = "RT-Tester MBT Installation Path";
    export var RTTESTER_RTTUI: string = "RT-Tester RTTUI3 Executable Path";
    export var RTTESTER_PYTHON: string = "Python Executable Path for RT-Tester";
    export var UPDATE_SITE = "update_site";
    export var DEV_UPDATE_SITE = "dev_update_site";
    export var EXAMPLE_REPO = "example_site";
    export var DEV_EXAMPLE_REPO = "dev_example_site";
    export var DEFAULT_PROJECTS_FOLDER_PATH = "default_projects_folder_path";
    export var ENABLE_TRACEABILITY = "enable_traceability";
    export var LOCAL_UPDATE_SITE = "local_update_site";
    export var USE_LOCAL_UPDATE_SITE = "use_local_update_site";
    export var GRAPH_MAX_DATA_POINTS = "graph_max_data_points";

    export var DEFAULT_VALUES: { [key: string]: any; } = {};
    DEFAULT_VALUES[RTTESTER_INSTALL_DIR] = 'C:/opt/rt-tester';
    DEFAULT_VALUES[RTTESTER_MBT_INSTALL_DIR] = "C:/opt/rtt-mbt";
    DEFAULT_VALUES[RTTESTER_RTTUI] = "C:/Program Files (x86)/Verified/RTTUI3/bin/rttui3.exe";
    DEFAULT_VALUES[RTTESTER_PYTHON] = "C:/Python27/python.exe";
    DEFAULT_VALUES[UPDATE_SITE] = "https://raw.githubusercontent.com/into-cps/into-cps.github.io/master/download/";
    DEFAULT_VALUES[DEV_UPDATE_SITE] = "https://raw.githubusercontent.com/into-cps/into-cps.github.io/development/download/";
    DEFAULT_VALUES[EXAMPLE_REPO] = "https://raw.githubusercontent.com/into-cps/into-cps.github.io/master/examples/examples.json";
    DEFAULT_VALUES[DEV_EXAMPLE_REPO] = "https://raw.githubusercontent.com/into-cps/into-cps.github.io/examples-dev/examples/examples.json";
    DEFAULT_VALUES[DEVELOPMENT_MODE] = false;
    DEFAULT_VALUES[COE_URL] = "localhost:8082";
    DEFAULT_VALUES[TRACE_DAEMON_PORT] = "8083";
    DEFAULT_VALUES[COE_DEBUG_ENABLED] = false;
    DEFAULT_VALUES[COE_REMOTE_HOST] = false;
    DEFAULT_VALUES[ENABLE_TRACEABILITY] = false;
    DEFAULT_VALUES[LOCAL_UPDATE_SITE] = "";
    DEFAULT_VALUES[USE_LOCAL_UPDATE_SITE] = false;
    DEFAULT_VALUES[GRAPH_MAX_DATA_POINTS] = 1000;
}
