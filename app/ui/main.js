define("ui/main", ["ui/header", "ui/filters", "ui/slidenav", "ui/toolbar", "webix"], function(header, filters, slidenav, toolbar) {

    function init() {
        viewerPanel = {
            rows: [toolbar, {
                view: "template",
                id: "viewer_panel",
                content: "image_viewer"
            }]
        };

        webix.ui(filters);
        
        webix.ui({
            container: "main_layout",
            id: "root",
            rows: [
                header, {
                    cols: [
                        slidenav, {
                            view: "resizer"
                        },
                        viewerPanel
                    ]
                }
            ]
        });

    }

    return {
        init: init
    }
});