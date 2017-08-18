require(["webix"], function() {

    /*
    Update the toolbar: add the filters button to the 
    main toolbar. This button allows the user to open
    the filter widget (window)
     */
    $$("toolbar").addView( {
        id: "apply_filter_btn",
        label: "Apply Filters",
        view: "button",
        click: ("$$('filters_window').show();")
    });

    /*
    reset()
        Reset all sliders to default values
     */
    function reset() {
        $$("contrast_slider").setValue(100);
        $$("brightness_slider").setValue(100);
        $$("saturation_slider").setValue(100);
        $$("hue_rotate_slider").setValue(0);
        $$("invert_slider").setValue(0);
        $$("blur_slider").setValue(0);
        $$("grayscale_slider").setValue(0);

        apply();
    }

    /*
    apply()
        Set the values and apply the new style to Openseadragon
        viewer
     */
    function apply() {
        var css = 'contrast(' + $$("contrast_slider").getValue() + '%) ' +
            'brightness(' + $$("brightness_slider").getValue() + '%) ' +
            'hue-rotate(' + $$("hue_rotate_slider").getValue() + ') ' +
            'saturate(' + $$("saturation_slider").getValue() + '%) ' +
            'invert(' + $$("invert_slider").getValue() + '%) ' +
            'grayscale(' + $$("grayscale_slider").getValue() + '%) ' +
            'blur(' + $$("blur_slider").getValue() + 'px)';

        $('.magic').css('-webkit-filter', css);
        $('.openseadragon-canvas').css('-webkit-filter', css);
    }

    //Window for slide filters
    var contrastSlider = {
        view: "slider",
        type: "alt",
        label: "Contrast",
        value: 100,
        max: 100,
        id: "contrast_slider",
        title: webix.template("Selected: #value#"),
        on: {
            "onSliderDrag": apply,
            "onChange": apply
        }
    };

    var brightnessSlider = {
        view: "slider",
        type: "alt",
        label: "Brightness",
        value: 100,
        max: 100,
        id: "brightness_slider",
        title: webix.template("Selected: #value#"),
        on: {
            "onSliderDrag": apply,
            "onChange": apply
        }
    };

    var saturationSlider = {
        view: "slider",
        type: "alt",
        label: "Saturation",
        value: 100,
        max: 100,
        id: "saturation_slider",
        title: webix.template("Selected: #value#"),
        on: {
            "onSliderDrag": apply,
            "onChange": apply
        }
    };

    var hueSlider = {
        view: "slider",
        type: "alt",
        label: "Hue Rotate",
        value: 0,
        max: 360,
        id: "hue_rotate_slider",
        title: webix.template("Selected: #value#"),
        on: {
            "onSliderDrag": apply,
            "onChange": apply
        }
    };

    var invertSlider = {
        view: "slider",
        type: "alt",
        label: "Invert",
        value: 0,
        max: 100,
        id: "invert_slider",
        title: webix.template("Selected: #value#"),
        on: {
            "onSliderDrag": apply,
            "onChange": apply
        }
    };

    var blurSlider = {
        view: "slider",
        type: "alt",
        label: "Blur",
        value: 0,
        max: 10,
        id: "blur_slider",
        title: webix.template("Selected: #value#"),
        on: {
            "onSliderDrag": apply,
            "onChange": apply
        }
    };

    var grayscaleSlider = {
        view: "slider",
        type: "alt",
        label: "Grayscale",
        value: 0,
        max: 100,
        id: "grayscale_slider",
        title: webix.template("Selected: #value#"),
        on: {
            "onSliderDrag": apply,
            "onChange": apply
        }
    };

    var view = {
        view: "window",
        move: true,
        head: {
            view: "toolbar",
            margin: -4,
            cols: [{
                view: "label",
                label: "Slide Filters"
            }, {
                view: "icon",
                icon: "times-circle",
                click: "$$('filters_window').hide();"
            }]
        },
        position: "center",
        id: "filters_window",
        body: {
            view: "form",
            width: 400,
            elements: [
                contrastSlider, brightnessSlider, saturationSlider, hueSlider, invertSlider, blurSlider, grayscaleSlider, {
                    margin: 5,
                    cols: [{
                        view: "button",
                        value: "Reset All",
                        click: reset
                    }]
                }
            ]
        }
    };

    webix.ui(view);
});