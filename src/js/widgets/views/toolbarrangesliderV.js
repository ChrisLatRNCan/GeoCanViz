/*
*
* GeoCanViz viewer / Visionneuse GéoCanViz
* gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
*
* Toolbar range slider widget
*/
 (function() {
    'use strict';
    define(['jquery-private',

        'gcviz-vm-tbrangeslider'
    ], function($viz, tbrangesliderVM) {
        var initialize;

            initialize = function($mapElem) {
                var $toolbar,
                config = $mapElem.toolbarrangeslider,
                mapid = $mapElem.mapframe.id,
                node = '';


                // find toolbar and start to add items
                $toolbar = $mapElem.find('.gcviz-tbrangeslider-content');

                // add header
                node += '<div class="vert-margin-1">' + config.label.value + '</div>';

                // add info table section
                node += '<div class="gcviz-table">' +
                            '<div class="gcviz-tbl-row">' +
                                '<div class="col-row-head"></div>' +
                                '<div class="row-head col-min" data-bind="text: spnRSlidermin"><button class="gcviz-custom16-btn" data-bind="click: flipMinLockState"></button>></div>' +
                                '<div class="row-head col-max" data-bind="text: spnRSlidermax"></div>' +
                                '<div class="row-head col-delta" data-bind="text: spnRSliderdelta"><button class="gcviz-custom16-btn" data-bind="click: flipDeltaLockState"></button></div>' +
                                '<div class="row-head col-nbrelm" data-bind="text: spnRSlidernbrelem"></div>' +
                                '<div class="row-head col-percent">%</div>' +
                            '</div>' +
                            '<div class="gcviz-tbl-row row-select">' +
                                '<div class="col-row-head" data-bind="text: infoRSliderSelect"></div>';
                // dealing with date format (no input)
                if (config.common.data.value === 3) {
                    node += '<div class="col-delta" data-bind="text: inRSliderselminval"></div>' +
                            '<div class="col-delta" data-bind="text: inRSliderselmaxval"></div>';
                    // eventually add input
                    // node += '<div class="col-min in-min"><input type="date" data-bind="value: inRSliderselminval, event: { input: playTable.bind($data, \'min\'), change: playTable.bind($data, \'min\')}, inputBubble: false, changeBubble: false, attr: inputMinOptions"/></div>' +
                    //         '<div class="col-max in-max"><input type="date" data-bind="value: inRSliderselmaxval, event: { input: playTable.bind($data, \'max\'), change: playTable.bind($data, \'max\')}, inputBubble: false, changeBubble: false, attr: inputMaxOptions"/></div>';
                } else { // dealing with number format (with input)
                    node += '<div class="col-min in-min"><input type="number" data-bind="value: inRSliderselminval, event: { input: playTable.bind($data, \'min\'), change: playTable.bind($data, \'min\')}, inputBubble: false, changeBubble: false, attr: inputMinOptions"/></div>' +
                            '<div class="col-max in-max"><input type="number" data-bind="value: inRSliderselmaxval, event: { input: playTable.bind($data, \'max\'), change: playTable.bind($data, \'max\')}, inputBubble: false, changeBubble: false, attr: inputMaxOptions"/></div>';
                }

                // remaining part of the info section
                node += '<div class="col-delta" data-bind="text: spnRSliderseldeltaval"></div>' +
                                '<div class="col-nbrelm" data-bind="text: spnRSliderselnbrelemval"></div>' +
                                '<div class="col-percent" data-bind="text: spnRSliderselperc"></div>' +
                            '</div>' +
                            '<div class="gcviz-tbl-row row-extent">' +
                                '<div class="col-row-head" data-bind="text: infoRSliderExtent"></div>' +
                                '<div class="col-min" data-bind="text: spnRSliderextminval"></div>' +
                                '<div class="col-max" data-bind="text: spnRSliderextmaxval"></div>' +
                                '<div class="col-delta" data-bind="text: spnRSliderextdeltaval"></div>' +
                                '<div class="col-nbrelm" data-bind="text: spnRSliderextnbrelemval"></div>' +
                                '<div class="col-percent" data-bind="text: spnRSliderextperc"></div>' +
                            '</div>' +
                        '</div>' +
                        '<div><span class="gcviz-rslider-prtinter" data-bind="text: infoRSliderinterval"></span><span class="gcviz-rslider-interval" data-bind="text: spnRSliderinterval"></span></div>';

                // add range slider
                node += '<div class="gcviz-rslider-wgt" data-bind="rslider: updVals, sliderOptions: inSliderOptions"></div>';

                // media buttons
                node += '<div class="gcviz-media-ctrl">' +
                            '<button class="gcviz-custom16-btn gcviz-stepbw-btn" data-bind="click: play.bind($data,\'STEP\',\'BWD\'), clickBubble: false"></button>' +
                            '<button class="gcviz-custom16-btn" data-bind="click: play.bind($data,\'PLAY\',\'BWD\'), clickBubble: false, css: playPauseStyleBWD "></button>' +
                            '<button class="gcviz-custom16-btn" data-bind="click: play.bind($data,\'PLAY\',\'FWD\'), clickBubble: false, css: playPauseStyleFWD "></button>' +
                            '<button class="gcviz-custom16-btn gcviz-stepfw-btn" data-bind="click: play.bind($data,\'STEP\',\'FWD\'), clickBubble: false"></button>' +
                            '<button class="gcviz-custom16-btn gcviz-reset-btn" data-bind="click: resetSlider, clickBubble: false"></button>' +
                        '</div>';

                $toolbar.append(node);
                return(tbrangesliderVM.initialize($toolbar, mapid, config));
            };

            return {
                initialize: initialize
            };
        });
    }).call(this);
