require = {
    urlArgs: "bust=" + (+new Date),
    paths: {
        "d3": "bower_components/d3/d3.min",
        "osd": "bower_components/openseadragon/built-openseadragon/openseadragon/openseadragon.min",
        "webix": "bower_components/webix/codebase/webix",
        "jquery": "bower_components/jquery/dist/jquery.min",
        "pubsub": "bower_components/PubSubJS/src/pubsub",
        "config": "app/config",
        "viewer": "app/viewer",
        "app": "app/app",
        "aperio": "app/ui/plugins/aperio",
        "filters": "app/ui/plugins/filters",
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
            name: "common",
            location: "app/ui/common"
        }
    ]
};