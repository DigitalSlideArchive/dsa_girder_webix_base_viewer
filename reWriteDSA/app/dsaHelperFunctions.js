define("app/dsaHelperFunctions", ["app/config", "webix"], function(config, webix) {

    //webix.message("Loading Helper Functions");


    /*This helper function already assumes you have retrieved the tile Properties
    for the given item, as I want to keep them separately for other reasons.. */
    buildOSDTileSource = function(baseURL, itemInfo, tileProps) {
       
        i = itemInfo;
        t = JSON.parse(tileProps);
        console.log(i);
        console.log(t); 
        var tileSourceFunction = (function(i) {
            console.log(i);
            return function(level, x, y) {
                return baseURL + '/item/' + i._id + '/tiles/zxy/' + level + '/' + x + '/' + y + '?edge=crop'
            }
        })(i);

        tileSource = {
            width: t.sizeX,
            height: t.sizeY,
            tileWidth: t.tileWidth,
            tileHeight: t.tileHeight,
            minLevel: 0,
            maxLevel: t.levels - 1,
            getTileUrl: tileSourceFunction

        }
        //Can inject additional properties into the tileSource like default color
        //note by feeding in the width instead of scaling from 0-1, we use actual pixel dimensions
        
        tileObject = { tileSource: tileSource, width: t.sizeX }
        return tileObject
    };





    function makePromise(url) {
        // Sets up a promise in the proper way using webix
        return new webix.promise(function(success, fail) {
            webix.ajax(url, function(text) {
                if (text) success(text);
                else fail(text.error)
            })
        })
    }


    function girderHelpers(requestType, girderObject = null, recurse = false) {

        itemsToGet = 2000; //Eventually I need to figure out how to do paging properly..

        switch (requestType) {
            case 'getResourceID':
                url = config.BASE_URL + "/resource/lookup?path=" + config.RESOURCE_PATH;
                console.log(url);
                promise = makePromise(url);
                break;
            case 'getFolders':
                //This will determine if the passed resource is a girder Folder or girder Collection
                //and list the childrenAppropriately
                parentType = "folder";
                console.log(girderObject);
                url = config.BASE_URL + "/folder?limit=" + itemsToGet + "&parentType=" + girderObject._modelType + "&parentId=" + girderObject._id;
                console.log(url);
                promise = makePromise(url);
                break;

                // case 'listFoldersInCollection':
                // case 'listFoldersinFolder':
                //     url = config.BASE_URL + "/folder?limit=5000&parentType=folder&parentId=" + girderObjectID;
                //     url = config.BASE_URL + "/folder?parentType=folder&parentId=" + girderObjectID + "&limit=500";
                //     promise = makePromise(url);
                //     break;
                //     //adrc.digitalslidearchive.emory.edu:8080/api/v1/item?folderId=5ad11d6a92ca9a001adee5b3&limit=50&sort=lowerName&sortdir=1
                // case 'listItemsInFolder':
                //     url = config.BASE_URL + "/item?folderId=" + girderObjectID + "&limit=5000"
                //     // url = config.BASE_URL + "/item?limit=500&folderId=" + girderObjectID;
                //     promise = makePromise(url);
                //     break;
            case 'getLargeImageProps':
                url = config.BASE_URL + "/item/" + girderObject._id + "/tiles";
                console.log(url);
                promise = makePromise(url);
                break;
            case 'recurseGetItems':
                url = config.BASE_URL + "/resource/" + girderObject._id + "/items?type=folder&limit=5000&sort=_id&sortdir=1";
                console.log(url);
                promise = makePromise(url);
                break;
            default:
                console.log("No case found.....errors will happen");
        }
        return promise;
    }


    // function recomputePagerItems() {
    //        var itemWidth = $$("slideSelector").config.type.width;
    //        var itemHeight = $$("slideSelector").config.type.height;
    //        var dataWidth = $$("slideSelector").$width;
    //        var dataHeight = $$("slideSelector").$height;

    //        var pagerSize = $$("slideSelector").getPager().config.size;

    //        /* Compute items per row and items per column */
    //        thumbsPerRow = Math.floor(dataWidth / itemWidth);
    //        if (thumbsPerRow < 1) { thumbsPerRow = 1 }

    //        thumbsPerCol = Math.floor(dataHeight / itemHeight);
    //        if (thumbsPerCol < 1) { thumbsPerCol = 1 }
    //        //    console.log(thumbsPerCol,thumbsPerRow);

    //        pagerSize = thumbsPerCol * thumbsPerRow;
    //        $$("slideSelector").getPager().define({ size: pagerSize });
    //        $$("slideSelector").refresh()
    //    }


    dsaHelperFunctions = { "girderHelpers": girderHelpers, "buildOSDTileSource": buildOSDTileSource }

    return dsaHelperFunctions;
});