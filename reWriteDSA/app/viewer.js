/* viewer.js

Description:
  This module initializes and defines the configurations for the Openseadragon
  viewer. Any additional configurations and event handlers should be added here.

Dependencies:
  - osd: Openseadragon module

Return:
  - viewer - Openseadragon viewer object
 */

// define(["osdImgHelper","osd", "pubsub","config"], function(oshIH, osd, pubsub,config) {
define("app/viewer", function() {




            testImages = {
                duomo: {
                    Image: {
                        xmlns: 'http://schemas.microsoft.com/deepzoom/2008',
                        Url: 'http://openseadragon.github.io/example-images/duomo/duomo_files/',
                        Format: 'jpg',
                        Overlap: '2',
                        TileSize: '256',
                        Size: {
                            Width: '13920',
                            Height: '10200'
                        }
                    }
                },
                highsmith: {
                    Image: {
                        xmlns: 'http://schemas.microsoft.com/deepzoom/2008',
                        Url: 'http://openseadragon.github.io/example-images/highsmith/highsmith_files/',
                        Format: 'jpg',
                        Overlap: '2',
                        TileSize: '256',
                        Size: {
                            Width: '7026',
                            Height: '9221'
                        }
                    }
                }}

                function createOpenSeadragonViewer(obj, divId) {
                    this.viewer = new OpenSeadragon.Viewer({
                        //        element: templateNode,
                        id: divId,
                        prefixUrl: "node_modules/openseadragon/build/openseadragon/images/",
                        navigatorPosition: "BOTTOM_RIGHT",
                        showNavigator: true,
                        //tileSources: [testImages.highsmith]
                    });
                    return this.viewer;
                }
                return createOpenSeadragonViewer
            })

        // ["osd", "config", "pubsub","svg"], function(osd, config, pubsub) {
        //this loads after the viewer is created..