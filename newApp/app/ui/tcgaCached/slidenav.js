define("tcgaCached/slidenav", ["config", "viewer", "pubsub", "slide", "jquery", "tcgaSlideCache", "webix"], function(config, viewer, pubsub, slide, $, tcgaSlideCache) {

    $.extend({
        getQueryParameters: function(str) {
            return (str || document.location.search).replace(/(^\?)/, '').split("&").map(function(n) { return n = n.split("="), this[n[0]] = n[1], this }.bind({}))[0];
        }
    });


        ///look into this..history.pushState(null, "", location.href.split("?")[0]);

        //use this to keep things updated baased on where your navigating.. TO DO FEATURE!

    //This proxy is used to get ALL the items associated with a case using a small subset at a time
    webix.proxy.PagingGirderItems = {
        $proxy: true,
        load: function(view, callback, details) {
            if (details) {
                var data = webix.ajax(this.source + "?limit=" + details.count + "&offset=" + details.start);
            } else {
                var data = webix.ajax(this.source + "?limit=15&offset=0");
            }

            data.then(function(resp) {
                webix.ajax.$callback(view, callback, resp.text());
            });
        }
    };
    //LAYOUT consists of two dropdowns followed by a dataview
    //  it's  slideset -->  ptSamples --->slideSelector(dv)

    function recomputePagerItems() {
        var itemWidth = $$("slideSelector").config.type.width;
        var itemHeight = $$("slideSelector").config.type.height;
        var dataWidth = $$("slideSelector").$width;
        var dataHeight = $$("slideSelector").$height;
        var pagerSize = $$("slideSelector").getPager().config.size;
        /* Compute items per row and items per column */
        thumbsPerRow = Math.floor(dataWidth / itemWidth);
        if (thumbsPerRow < 1) { thumbsPerRow = 1 }

        thumbsPerCol = Math.floor(dataHeight / itemHeight);
        if (thumbsPerCol < 1) { thumbsPerCol = 1 }
        //    console.log(thumbsPerCol,thumbsPerRow);
        pagerSize = thumbsPerCol * thumbsPerRow;
        $$("slideSelector").getPager().define({ size: pagerSize });
        $$("slideSelector").refresh()
    }

    var slideSelector = {
        view: "dataview",
        id: "slideSelector",
        select: true,
        template: "<div class='webix_strong'>#name#</div><img src='" + config.BASE_URL + "/item/#_id#/tiles/thumbnail'/>",
        pager: "item_pager",
        datafetch: 25,
        type: {
            height: 170,
            width: 200
        },
        on: {
            onItemClick: function(id, e, node) {
                var item = this.getItem(id);
                slide.init(item);
            },
            onAfterLoad: function() {
                if (this.getFirstId()) {
                    var item = this.getItem(this.getFirstId());
                    slide.init(item);
                }
            }
        }
    };

    itemPager = {
        view: "pager",
        id: "item_pager",
        height: 45,
        template: "<center>{common.prev()}{common.page()}/#limit#{common.next()}<br/>(#count# slides)</center>",
        animate: true,
        size: 5,
        group: 4
    };

    cohortDropdown = {
        view: "combo",
        placeholder: "Select Cohort",
        id: "slideset",
        options: {
            body: {
                template: "#name#",
                data: tcgaSlideCache.tcgaSlideCache,
            }
        },
        on: {
            onChange: function(id) {
                var cohortItem = this.getPopup().getBody().getItem(id);
                $$("slideSelector").clearAll();
                $$("slideSelector").setPage(0);
                //Also clear the thumbnails if any that were being rendered

                $$("ptSamples").setValue(); //need to refresh the panel

                $$("ptSamples").getList().clearAll();
                $$("ptSamples").getList().parse(cohortItem["caseListData"]);
                //load the cases for the newly selected cohort
                var url = "PagingGirderItems->" + config.BASE_URL + "/tcga/cohort/" + cohortItem._id + "/images";
                $$("slideSelector").clearAll();
                $$("slideSelector").load(url);
            },
            onAfterRender: webix.once(function() {

                //Migrating to using a cached list...
                var cohorts = tcgaSlideCache.tcgaSlideCache;
                qp = $.getQueryParameters();
                //FIRST LOAD THE ENTIRE SLIDE CACHE
                //see if there is a key for this patient in the cohort cache
                if (tcgaSlideCache.ptIdCache[qp.patientId]) {
                    selectedCohortId = tcgaSlideCache.ptIdCache[qp.patientId].cohortId;
                    selectedcaseId = tcgaSlideCache.ptIdCache[qp.patientId].caseId;

                    $$("slideset").setValue(selectedCohortId);
                    $$("ptSamples").getList().clearAll();
                    $$("ptSamples").getList().parse(
                        $$("slideset").getList().getItem(selectedCohortId).caseListData
                    );

                    webix.delay(function() {
                        $$("ptSamples").setValue(selectedcaseId)
                    }, "", [], 500);

                } else {
                    //This loads the slideSet we want
                    //                console.log("loading cohort",cohortIdxToLoad);
                    selectedCohortId = $$("slideset").getList().getFirstId();
                    var ptSamples = $$("ptSamples").getPopup().getList();
                    console.log(cohorts[0].caseListData);
                    ptSamples.parse(cohorts[0].caseListData);
                    $$("slideset").setValue(cohorts[0].id);
                    //Initially I load all available slides..
                    var url = "PagingGirderItems->" + config.BASE_URL + "/tcga/cohort/" + selectedCohortId + "/images";
                    $$("slideSelector").clearAll();
                    $$("slideSelector").load(url);
                }
            })
        }
    };

    ptSamplesDropdown = {
        view: "combo",
        placeholder: "Select Patient",
        id: "ptSamples",
        options: {
            filter: function(item, value) {
                if (item.name.toString().toLowerCase().indexOf(value.toLowerCase()) > -1)
                    return true;
                return false;
            },
            body: {
                template: "#name#"
            }
        },
        on: {
            onChange: function(id) {
                if (id) {
                    var item = this.getPopup().getBody().getItem(id);
                    var thumbs = $$("slideSelector");
                    var BASE_URL = config.BASE_URL + "/tcga/case/" + item.id + "/images";
                    thumbs.clearAll();
                    thumbs.setPage(0);
                    thumbs.load(BASE_URL);
                }
            }
        }
    };

    //slides panel is the left panel, contains two rows 
    //containing the slide group dropdown and the thumbnails panel 
    var wideIcon = "<span class='aligned wide webix_icon fa-plus-circle'></span>";
    var narrowIcon = "<span class='aligned narrow webix_icon fa-minus-circle'></span>";
    var slidesPanel = {
        id: "slidenav",
        header: "Slides " + wideIcon + narrowIcon,
        onClick: {
            wide: function(event, id) {
                var count = $$("slideSelector").count();
                this.config.width = 205 * 6;
                this.resize();

                $$("item_pager").config.size = Math.min(30, count);
                $$("item_pager").refresh();
                $$("slideSelector").refresh();
                return false;
            },
            narrow: function(event, id) {
                this.config.width = 220;
                this.resize();

                $$("item_pager").config.size = 5;
                $$("item_pager").refresh();
                $$("slideSelector").refresh();
                return false;
            }
        },
        body: {
            rows: [
                cohortDropdown, ptSamplesDropdown, itemPager, slideSelector
            ]
        },
        width: 220
    };

    webix.attachEvent("onResize", function() {
        recomputePagerItems();
    })

    return slidesPanel;
});