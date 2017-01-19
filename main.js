require = {
    urlArgs: "bust=" + (+new Date),
    paths: {
        "osd": "bower_components/openseadragon/built-openseadragon/openseadragon/openseadragon.min",
        "webix": "bower_components/webix/codebase/webix",
        "jquery": "bower_components/jquery/dist/jquery.min",
        "config": "app/config",
        "viewer": "app/viewer",
        "app": "app/app"
    },

    packages: [
        {
            name: "ui",
            location: "app/ui"
        },
        {
            name: "standard",
            location: "app/ui/standard"
        },
        {
            name: "tcga",
            location: "app/ui/tcga"
        },
        {
            name: "widgets",
            location: "app/ui/widgets"
        },
        {
            name: "common",
            location: "app/ui/common"
        }
    ]
};