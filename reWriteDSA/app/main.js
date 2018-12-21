require = {
    urlArgs: "bust=" + (+new Date),
    paths: {
            "webix": "node_modules/webix/webix"
        },

     // Packages gives a name and points to a directory where a main.js file will be looked for
    // Example: when you specify "standard" in [] in define, it looks at that location, say app/ui/standard/, for a main.js fle
    // You can also specify a file in the directory by using [name/file] on the define function
    packages: [
    	{
            name: "ui",
            location: "app/ui"
        },
		{
            name: "common",
            location: "app/ui/common"
        },

        ],
}
    // paths specify js files with the name given. Example: app/app looks for app.js in the app directory
//     paths: {
//         "fabric": "node_modules/fabric.js/dist/fabric.min",
//         "osdfabric": "node_modules/OpenseadragonFabricjsOverlay/openseadragon-fabricjs-overlay",
//         "hasher": "node_modules/hasher/dist/js/hasher.min",
//         "signals": "node_modules/js-signals/dist/signals.min",
//         "crossroads": "node_modules/crossroads/dist/crossroads.min",
//         "d3": "node_modules/d3/dist/d3.min",
//         "svg": "js/svg-overlay/openseadragon-svg-overlay",
//         "osd": "node_modules/openseadragon/build/openseadragon/openseadragon.min",
//         "geo": "node_modules/geojs/geo",
//         "webix": "node_modules/webix/webix",
//         "jquery": "node_modules/jquery/dist/jquery.min",
//         "pubsub": "js/PubSubJS/src/pubsub",
//         "config": "app/config",
//         "slide": "app/slide",
//         "viewer": "app/viewer",
//         "routes": "app/routes",
//         "app": "app/app",
//         "aperio": "app/plugins/aperio",
//         "filters": "app/plugins/filters",
//         "pathology": "app/plugins/pathology",
//         "tcgaSlideCache": "app/plugins/tcgaSlideCache",
//         "metadata": "app/plugins/metadata",
//         "annotations": "app/plugins/annotations",
//         "login": "app/login",
//         "session": "app/session",
//         "tagger": "app/plugins/tagger",
//         "hammerjs": "js/hammer",
//         "osdImgHelper": "node_modules/openseadragon-imaginghelper/index",
//         "dsaHelperFunctions": "app/dsaHelperFunctions",
//         "deepLinker": "app/deepLinker"

//     },

//     shim: {
//         "osdFilters": ["osd"],
//         "svg": ["osd"],
//         "common": ["login"],
//         "osdImgHelper": ["osd", "svg"],
//         "geo": ["hammerjs"]

//     },
//     // Packages gives a name and points to a directory where a main.js file will be looked for
//     // Example: when you specify "standard" in [] in define, it looks at that location, say app/ui/standard/, for a main.js fle
//     // You can also specify a file in the directory by using [name/file] on the define function
//     packages: [{
//             name: "ui",
//             location: "app/ui"
//         },
//         {
//             name: "standard",
//             location: "app/ui/standard"
//         },
//         {
//             name: "tcga",
//             location: "app/ui/tcga"
//         },
//         {
//             name: "tcgaCached",
//             location: "app/ui/tcgaCached"
//         },
//         {
//             name: "common",
//             location: "app/ui/common"
//         },
//     ]
// };
