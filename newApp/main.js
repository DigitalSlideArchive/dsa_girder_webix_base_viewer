require = {
    urlArgs: "bust=" + (+new Date),

    // paths specify js files with the name given. Example: app/app looks for app.js in the app directory
    paths: {
        "fabric": "node_modules/fabric.js/dist/fabric.min",
        "osdfabric": "node_modules/OpenseadragonFabricjsOverlay/openseadragon-fabricjs-overlay",
        "hasher": "node_modules/hasher/dist/js/hasher.min",
        "signals": "node_modules/js-signals/dist/signals.min",
        "crossroads": "node_modules/crossroads/dist/crossroads.min",
        "d3": "node_modules/d3/dist/d3.min",
        "svg": "js/svg-overlay/openseadragon-svg-overlay",
        "osd": "node_modules/openseadragon/build/openseadragon/openseadragon.min",
        "geo": "node_modules/geojs/geo",
        //"geo": "js/geo",
        "webix": "node_modules/webix/webix",
        "jquery": "node_modules/jquery/dist/jquery.min",
        // "pubsub": "node_modules/PubSubJS/src/pubsub",
        "pubsub": "js/PubSubJS/src/pubsub",
        "config": "app/config",
        "slide": "app/slide",
        "viewer": "app/viewer",
        "routes": "app/routes",
        "app": "app/app",
        "aperio": "app/plugins/aperio",
        "filters": "app/plugins/filters",
        "pathology": "app/plugins/pathology",
        "metadata": "app/plugins/metadata",
        "annotations": "app/plugins/annotations",
        //         "derm": "app/plugins/derm",
        "login": "app/login",
        "session": "app/session",
        "tagger": "app/plugins/tagger",
//        "hammerjs": "node_modules/hammerjs/hammer",
        "hammerjs": "js/hammer",
        "osdImgHelper": "node_modules/openseadragon-imaginghelper/index",
 
    },

    shim: {
        "osdFilters": ["osd"],
        "svg": ["osd"],
        "common": ["login"],
        "osdImgHelper": ["osd", "svg"],
        "geo": ["hammerjs"]

    },

            //         "slideDetails": "app/plugins/slideDetails",
        // "simpleAnnotationPanel": "app/plugins/simpleAnnotationPanel",
        //         "thumbLabeler": "app/plugins/thumbLabeler",
        //         "simpleMultiViewerHelper": "app/simpleMultiViewerHelper",
        //         "osdFilters": "app/externalJS/openseadragon-filtering",
       //         "folderMetadata": "app/plugins/folderMetadata",
        //         "zoomButtons": "app/plugins/zoomButtons"


    // Packages gives a name and points to a directory where a main.js file will be looked for
    // Example: when you specify "standard" in [] in define, it looks at that location, say app/ui/standard/, for a main.js fle
    // You can also specify a file in the directory by using [name/file] on the define function
    packages: [{
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
        },
    ]
};
