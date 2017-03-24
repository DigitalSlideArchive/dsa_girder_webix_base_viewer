require = {
    urlArgs: "bust=" + (+new Date),
    paths: {
        "fabric": "bower_components/fabric.js/dist/fabric.min",
        "osdfabric": "bower_components/OpenseadragonFabricjsOverlay/openseadragon-fabricjs-overlay",
        "hasher": "bower_components/hasher/dist/js/hasher.min",
        "signals": "bower_components/js-signals/dist/signals.min",
        "crossroads": "bower_components/crossroads/dist/crossroads.min",
        "d3": "bower_components/d3/d3.min",
        "svg": "bower_components/svg-overlay/openseadragon-svg-overlay",
        "osd": "bower_components/openseadragon/built-openseadragon/openseadragon/openseadragon.min",
        "webix": "bower_components/webix/codebase/webix",
        "jquery": "bower_components/jquery/dist/jquery.min",
        "pubsub": "bower_components/PubSubJS/src/pubsub",
        "config": "app/config",
        "slide": "app/slide",
        "viewer": "app/viewer",
        "routes": "app/routes",
        "app": "app/app",
        "aperio": "app/plugins/aperio",
        "filters": "app/plugins/filters",
        "pathology": "app/plugins/pathology",
        "metadata": "app/plugins/metadata",
        "annotations": "app/plugins/annotations"
    },

    shims:{
        "svg": ["osd"]
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