require = {
    urlArgs: "bust=" + (+new Date),
    paths: {
        "d3": "bower_components/d3/d3.min",
        "svg": "bower_components/svg-overlay/openseadragon-svg-overlay",
        "osd": "bower_components/openseadragon/built-openseadragon/openseadragon/openseadragon.min",
        "webix": "bower_components/webix/codebase/webix",
        "jquery": "bower_components/jquery/dist/jquery.min",
        "pubsub": "bower_components/PubSubJS/src/pubsub",
        "config": "app/config",
        "slide": "app/slide",
        "viewer": "app/viewer",
        "app": "app/app",
        "aperio": "app/plugins/aperio",
        "filters": "app/plugins/filters",
    },

    shim:{
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