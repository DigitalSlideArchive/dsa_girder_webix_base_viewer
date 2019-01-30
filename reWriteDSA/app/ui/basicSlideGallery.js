/* This is a slide gallery panel */

define("app/ui/basicSlideGallery", ["app/config", "app/dsaHelperFunctions", "webix"],
    function(config, helpers, webix) {

        ///To Do:: Only add Items that have the largeImage flag set.. 
        //This shows a small thumbnail and below it shows the name or template for the slide
        var itemPager = {
            view: "pager",
            id: "itemPager",
            template: "<center>{common.prev()}{common.page()}/#limit#{common.next()}(#count# slides)</center>",
            animate: true,
            size: 5,
            group: 4
        };

        webix.type(webix.ui.dataview, {
            name: "smallThumb",
            template: "<div class='webix_strong'>#name#</div><img src='" +
                config.BASE_URL + "/item/#_id#/tiles/thumbnail?width=128'/>",
            height: 150,
            width: 150
        });

        webix.type(webix.ui.dataview, {
            name: "mediumThumb",
            template: "<div class='webix_strong'>#name#</div><img src='" +
                config.BASE_URL + "/item/#_id#/tiles/thumbnail?width=256'/>",
            height: 256,
            width: 256
        });

        webix.type(webix.ui.dataview, {
            name: "largeThumb",
            template: "<div class='webix_strong'>#name#</div><img src='" +
                config.BASE_URL + "/item/#_id#/tiles/thumbnail?width=384'/>",
            height: 384,
            width: 300
        });

        webix.applyTemplateSmall = function() {
            $$('slideGallery').define('type', 'smallThumb');
            $$('slideGallery').render();
        };

        webix.applyTemplateMed = function() {
            $$('slideGallery').define('type', 'mediumThumb');
            $$('slideGallery').render();
        };

        webix.applyTemplateLarge = function() {
            $$('slideGallery').define('type', 'largeThumb');
            $$('slideGallery').render();
        };

        //I can have different templates available for the gallery, large thumbs, small thumbs
        // with or without text/ etc..
        var galleryViewSelector = {
            rows: [
                { view: "template", template: "Change Template", type: "header" },
                itemPager,
                {
                    margin: 10,
                    cols: [
                        { view: "button", type: "icon", icon: "wxi-pencil", value: "smallThumb", click: webix.applyTemplateSmall },
                        { view: "button", type: "icon", icon: "mdi mdi-bank", value: "medThumb", click: webix.applyTemplateMed },
                        { view: "button", type: "icon", icon: "fas fa-bullseye", value: "largeThumb", tooltip: "large Thumb", click: webix.applyTemplateLarge },
                        {
                            view: "button",
                            type: "icon",
                            icon: "wxi-columns",
                            label: "eXpand",
                            width: 80,
                            click: function() {

                                //Toggle the width of the view from either FULL Screen (need to figure out how to get that)
                                //Vs the width of the currently selected thumb
                                curWidth = $$("leftPanel").config.width;

                                $$("leftPanel").config.width = 1000;
                                $$("leftPanel").resize()

                                helpers.recomputePagerItems()
                            }
                        },
                    ]
                }
            ]
        }
        //https://snippet.webix.com/vnxlf960 to play around
        //      Icon name spaces are complicated
        //        https://forum.webix.com/discussion/32371/webix-5-3-font-awesome-5-0-10

        var flattenObject = function(ob) {
            var toReturn = {};

            for (var i in ob) {
                if (!ob.hasOwnProperty(i)) continue;

                if ((typeof ob[i]) == 'object') {
                    var flatObject = flattenObject(ob[i]);
                    for (var x in flatObject) {
                        if (!flatObject.hasOwnProperty(x)) continue;

                        toReturn[i + '.' + x] = flatObject[x];
                    }
                } else {
                    toReturn[i] = ob[i];
                }
            }
            return toReturn;
        };

        var slideItemSelected = function(newV) {
            curItemInfo = this.getSelectedItem();
            $$("curItemInfo").clearAll();
            //Will flatten the curItemInfo into k/v pairs to make it easier to view in a list
            flatItem = flattenObject(curItemInfo);
            flatArray = [];

            //Need to lookup the largeItem properties as well in order to build
            //an itemID..

            for (var key in flatItem) {
                if (flatItem.hasOwnProperty(key)) {
                    flatArray.push({ key: key, value: flatItem[key] })
                }
            }

            $$("curItemInfo").parse(flatArray);
            $$("dsaFooter").parse(curItemInfo);
            //console.log(curItemInfo);
            helpers.girderHelpers('getLargeImageProps', curItemInfo).then(function(tileData) {
                //console.log(tileData)
                //going to add these additional properties to the curren ItemInfo display
                $$("curItemInfo").parse(tileData);

                newTileSource = helpers.buildOSDTileSource(config.BASE_URL, curItemInfo, tileData)
                //I need to reformat the tileData into a tilesource...
                console.log(newTileSource)
                globalViewer.open([newTileSource]);

            });
        }

        var slideGallery = {
            view: "dataview",
            type: "smallThumb",
            id: "slideGallery",
            select: true,
            pager: "itemPager",
            on: {
                onAfterSelect: slideItemSelected,
                onAfterLoad: function() {
                    firstSlideId = this.getFirstId();
                    this.select(firstSlideId);
                }
            }
        }
        return { rows: [galleryViewSelector, slideGallery] }
    })