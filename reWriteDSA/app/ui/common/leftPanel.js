define("common/leftPanel",
	["app/ui/basicComboNavPanel", "app/ui/basicSlideGallery"], 
	function(basicComboNavPanel,slideGallery) {

    var leftPanel = {
        id: "leftPanel",
        header: "slide Nav Panel",
        multi: true,
        width: 400,
        gravity: 0.1,
        body: {
            gravity: 0.1    ,
            rows: [
                 basicComboNavPanel,
                {view:"resizer"},
                slideGallery
               
            ]
        }
    }
    return leftPanel
})