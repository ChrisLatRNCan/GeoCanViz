/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * Toolbar range slider view model widget
 */
(function() {
    'use strict';
    define(['jquery-private',
            'knockout',
            'gcviz-func',
            'gcviz-gisdatagrid',
            'gcviz-i18n'
        ], function($viz, ko, gcvizFunc, gisDG, i18n) {
        var initialize,
        vm = {};

            initialize = function($mapElem, mapid, config) {

            var toolbarrangesliderViewModel = function($mapElem, mapid, config) {
                var _self = this,
                    mapVM,
                    // common to all RSlider
                    layer = config.layer,
                    layerInfo, layerURL,
                    layerStatsInit = {min: 0, max: 0, count: 0},
                    layerStats = {min: 0, max: 0, count: 0, minT: 0, maxT: 0, delta: 0},
                    valueFormat = config.common.data.value,
                    // parent RSlider
                    minExtPrt,
                    maxExtPrt,
                    intervalPrt = config.parent.interval,
                    unitPrt = config.parent.unit,
                    timeExtent = 0,
                    timeExtConst = 0,
                    stepOnce = true,
                    direction = 'fwd',
                    duration = [100,1500],
                    defQueryConcat = '',
                    t0,t1,
                    intervalID,
                    minT, maxT,
                    $rSlider = $viz('gcviz-rslider-wgt');

                // function
                _self.zeroPad = zeroPad;
                _self.formatDT = formatDT;

                _self.$rSlider = $rSlider;
                _self.intervalPrt = intervalPrt;
                _self.intervalID = intervalID;
                _self.layerStatsInit = layerStatsInit;
                _self.layerStats = layerStats;
                _self.direction = direction;
                _self.timeExtent = timeExtent;
                _self.timeExtConst = timeExtConst;
                _self.stepOnce = stepOnce;
                _self.duration = duration;
                _self.defQueryConcat = defQueryConcat;
                _self.t0 = t0;
                _self.t1 = t1;
                _self.minT = minT;
                _self.maxT = maxT;
                _self.minExtPrt = minExtPrt;
                _self.maxExtPrt = maxExtPrt;

                // manage date format
                if (valueFormat === 3) {
                    _self.minExtPrt = (Date.parse(config.parent.minmax.min) + 43200000)/1000;
                    _self.maxExtPrt = (Date.parse(config.parent.minmax.max) + 43200000)/1000;
                    _self.intervalPrt = _self.intervalPrt*86400;
                    _self.spnRSliderextdeltaval = ko.observable((_self.maxExtPrt - _self.minExtPrt)/86400);
                } else { // default number format
                    _self.minExtPrt = config.parent.minmax.min;
                    _self.maxExtPrt = config.parent.minmax.max;

                    _self.spnRSliderextdeltaval = ko.observable(_self.maxExtPrt - _self.minExtPrt);
                }
                _self.spnRSliderinterval =  ' ' + config.parent.interval + ' ' + config.parent.unit;

                _self.minT = ko.observable(_self.minExtPrt);
                _self.maxT = ko.observable(_self.maxExtPrt);

                // there is a problem with the define. The gcviz-vm-map is not able to be set.
                // We set the reference to gcviz-vm-map (hard way)
                require(['gcviz-vm-map'], function(vmMap) {
                    mapVM = vmMap;
                });

                // viewmodel mapid to be access in tooltip and wcag custom binding
                _self.mapid = mapid;

                layerInfo = layer.layerinfo;
                layerURL = mapVM.getLayerURL(mapid, layerInfo.id);

                // add index if dynamic
                if (layerInfo.type === 4) {
                    layerURL += layerInfo.index;
                }
                _self.layerURL = layerURL;

                // info table section
                // tooltips, text strings and other things from dictionary
                _self.spnRSlidermin = i18n.getDict('%toolbarrangeslider-min');
                _self.spnRSlidermax = i18n.getDict('%toolbarrangeslider-max');
                _self.spnRSliderdelta = i18n.getDict('%toolbarrangeslider-delta');
                _self.spnRSlidernbrelem = i18n.getDict('%toolbarrangeslider-nbrelem');
                _self.infoRSliderSelect = i18n.getDict('%toolbarrangeslider-select');
                _self.infoRSliderExtent = i18n.getDict('%toolbarrangeslider-extent');
                _self.infoRSliderinterval = i18n.getDict('%toolbarrangeslider-interval');

                // manage date format
                if (valueFormat === 3) {
                    _self.minExtPrt = _self.minExtPrt;
                    _self.maxExtPrt = _self.maxExtPrt;

                    // slider initialisation
                    _self.inSliderOptions = {min: _self.minExtPrt, max: _self.maxExtPrt, step: _self.intervalPrt, range: true,
                        create: function(e, ui){
                            // add lock button to the first handle
                            var htmlBtn;
                            htmlBtn = $.parseHTML('<button class="gcviz-lock-btn" data-bind="click: flipLockState.bind(), css: minLockUnlock"></button>');
                            $(htmlBtn).appendTo(e.target.children[1]);
                        },
                        stop: function(e, ui){
                            _self.playHandles(e, ui);
                        },
                        slide: function(e, ui){
                            _self.minT(ui.values[0]);
                            _self.maxT(ui.values[1]);
                        }
                    };
                    // slider observables
                    _self.updVals = ko.observable({min: _self.minExtPrt, max: _self.maxExtPrt});

                    // info table section
                    // values and events observables
                    _self.inRSliderselminval = ko.computed( function() {
                                                    return _self.formatDT(new Date(_self.minT()*1000)); } );

                    _self.inRSliderselmaxval = ko.computed( function() {
                                                    return _self.formatDT(new Date(_self.maxT()*1000)); } );

                    // tries to get the delta in days
                    // 24 hrs/day x 60 min x 60 sec = 86400 sec
                    _self.spnRSliderseldeltaval = ko.computed( function() {
                        return Math.round((_self.maxT() - _self.minT())/86400);
                    });
                } else { // manage number format
                    // slider initialisation
                    _self.inSliderOptions = {min: _self.minExtPrt, max: _self.maxExtPrt, step: _self.intervalPrt, range: true,
                        create: function(e, ui){
                            // add lock button to the first handle
                            var htmlBtn;
                            htmlBtn = $.parseHTML('<button class="gcviz-lock-btn" data-bind="click: flipLockState.bind(), css: minLockUnlock"></button>');
                            $(htmlBtn).appendTo(e.target.children[1]);
                        },
                        stop: function(e, ui){
                            _self.playHandles(e, ui);
                        },
                        slide: function(e, ui){
                            _self.minT(ui.values[0]);
                            _self.maxT(ui.values[1]);
                        }
                    };

                    // slider observables
                    _self.updVals = ko.observable({min: _self.minExtPrt, max: _self.maxExtPrt});

                    _self.inRSliderselminval = ko.computed( function() {
                        return _self.minT();
                    });
                    _self.inRSliderselmaxval = ko.computed( function() {
                        return _self.maxT();
                    });
                    // spinner for the min value
                    _self.inputMinOptions = ko.computed( function() {
                        return {min: _self.minExtPrt, max: _self.inRSliderselmaxval(), step: _self.intervalPrt, range:true, onkeydown: "return false"};
                    });
                    // spinner for the max value
                    _self.inputMaxOptions = ko.computed( function() {
                        return {min: _self.inRSliderselminval(), max: _self.maxExtPrt, step: _self.intervalPrt, range:true, onkeydown: "return false"};
                    });

                    _self.spnRSliderseldeltaval = ko.computed( function() {
                        return _self.inRSliderselmaxval() - _self.inRSliderselminval();
                    });
                }

                // info table extent min and max
                _self.spnRSliderextminval = ko.observable(config.parent.minmax.min);
                _self.spnRSliderextmaxval = ko.observable(config.parent.minmax.max);

                // info table percentage column (extent and selection)
                _self.spnRSliderselperc = ko.observable(100);
                _self.spnRSliderextperc = ko.observable(100);
                _self.spnRSliderselnbrelemval = ko.observable(0);
                _self.spnRSliderextnbrelemval = ko.observable(0);

                // manage play/pause status for backward play
                _self.playPauseStateBWD = ko.observable('STOP');
                _self.playPauseStyleBWD = ko.computed( function() {
                    return _self.playPauseStateBWD() === 'STOP' ? 'gcviz-playbw-btn' : 'gcviz-pause-btn'; } );

                // manage play/pause status for forward play
                _self.playPauseStateFWD = ko.observable('STOP');
                _self.playPauseStyleFWD = ko.computed( function() {
                    return _self.playPauseStateFWD() === 'STOP' ? 'gcviz-playfw-btn' : 'gcviz-pause-btn'; } );

                // min lock status (LOCK:true|UNLOCK:false)
                _self.minLockState = ko.observable(false);
                _self.minLockUnlock = ko.computed( function() {
                    return _self.minLockState() === true ? 'gcviz-lock-state' : 'gcviz-unlock-state';
                });

                _self.flowStatus = ko.observable('INIT');
                _self.flowDirection = ko.observable('FWD');

                // Status to manage the flow
                _self.getFlowStatus = function() {
                    switch(_self.flowStatus()) {
                        case 'PLAY': // play buttons
                            gisDG.getCount(_self.layerURL, _self.defQueryConcat, _self.updateAll);
                            break;
                        case 'STEP': // stepper buttons
                            gisDG.getCount(_self.layerURL, _self.defQueryConcat, _self.updateAll);
                            break;
                        case 'JUMP': // reset, handles, range handling
                            gisDG.getCount(_self.layerURL, _self.defQueryConcat, _self.updateAll);
                            break;
                        case 'STOP': // stop
                            gisDG.getCount(_self.layerURL, _self.defQueryConcat, _self.updateAll);
                            break;
                        case 'INIT': // initialize
                            gisDG.getCount(_self.layerURL, _self.defQueryConcat, _self.storeStatsInit);
                            break;
                        default:
                            gisDG.getCount(_self.layerURL, _self.defQueryConcat, _self.updateAll);
                    }
                };

                mapVM.registerEvent(_self.mapid, "update-end", _self.getFlowStatus);

                _self.init = function() {

                    // call mapVM to check if map is loaded, if not wait for the map to load
                    // this will start the RSlider process
                    // also call in datagridVM
                    mapVM.startDatagrid(mapid, _self.onLoadMap);
                };

                // wait the map to be loaded and build a query to retrieve initial count
                _self.onLoadMap = function() {
                    var defQueryNew = '';

                    defQueryNew = _self.buildDefQuery(_self.minExtPrt, _self.maxExtPrt);
                    _self.defQueryConcat = _self.concatDefQuery(layer.layerinfo, defQueryNew, 0, false);
                };

                // initial features count
                _self.storeStatsInit = function (count) {
                    _self.layerStatsInit.count = count;
                    _self.spnRSliderselnbrelemval(count);
                    _self.spnRSliderextnbrelemval(count);
                };

                // update table with updated features count
                _self.updateAll = function (count) {
                    var percent = 0;

                    _self.spnRSliderselnbrelemval(count);

                    percent = Math.round((_self.spnRSliderselnbrelemval()/_self.spnRSliderextnbrelemval())*100);
                    _self.spnRSliderselperc(percent);

                    _self.updVals({min: _self.minT(), max: _self.maxT()});

                    // do we have to update the map ?
                    if (_self.flowStatus() === 'PLAY')
                    { _self.go2Target(_self.duration[1]); }
                    else {
                        _self.stop();
                        clearTimeout(_self.intervalID);
                    }
                };

                // flip the lock state of the min value (LOCK <-> UNLOCK)
                _self.flipLockState =  function() {
                    _self.minLockState(_self.minLockState() === true ? false : true);
                };

                // used by stepper and play buttons
                _self.play = function(mode, dir) {
                    var delay,
                        md = mode,
                        dirCurrent = _self.flowDirection();

                    if (md != 'STEP') {
                        md = _self.flowStatus() === 'PLAY' && dir === _self.flowDirection() ? 'STOP' : 'PLAY';
                    }

                    clearTimeout(_self.intervalID);
                    _self.stop();

                    // set the flow
                    _self.flowStatus(md);
                    _self.flowDirection(dir);

                    if ( mode === 'PLAY') {
                        if (dir === 'FWD') { _self.playPauseStateFWD('PLAY'); }
                        else {_self.playPauseStateBWD('PLAY'); }
                    }

                    // stepper needs to be almost instantaneous
                    // delay for a smoother and slowlyer UX
                    delay = md === 'STEP' ? _self.duration[0] : _self.duration[1];
                    _self.go2Target(delay);
                };

                _self.defineTarget = function() {
                    var plusMinusSign = _self.flowDirection() === 'FWD' ? 1 : -1,
                    offset = plusMinusSign*(_self.intervalPrt),
                    tMax = 0,
                    tMin = 0,
                    delta = 0;

                    if (_self.flowStatus() !== 'JUMP') {
                        if (_self.minLockState() === true) {
                            tMin = _self.updVals().min;
                            tMax = _self.updVals().max + offset;
                            _self.minT(tMin);
                            _self.maxT(tMax >= tMin &&
                            tMax <= _self.maxExtPrt ? tMax : _self.updVals().max);
                        } else { /*_self.minLockState()*/
                            tMin = _self.updVals().min + offset;
                            tMax = _self.updVals().max + offset;
                            delta = tMax - tMin;
                            tMin = tMin <= _self.maxExtPrt &&
                                    tMin >= _self.minExtPrt ? tMin : _self.updVals().min;
                            tMax = tMax >= _self.minExtPrt &&
                                    tMax <= _self.maxExtPrt ? tMax : _self.updVals().max;
                            if (delta === (tMax - tMin)) {
                                _self.minT(tMin);
                                _self.maxT(tMax);
                            } else {
                                _self.minT(_self.updVals().min);
                                _self.maxT(_self.updVals().max);
                            }
                        }
                    }
                };

                // can we move
                _self.executeDecision = function() {
                    var go = false;

                    if (_self.flowStatus() === 'JUMP') {
                        go = true;
                    } else if (_self.minLockState() ) {
                        go = _self.maxT() !== _self.updVals().max;
                    } else { /*_self.minLockState() === false*/
                        go = _self.minT() !== _self.updVals().min;
                    }

                    if (go === false) { _self.stop(); }

                    return go;
                };

                // define the query and execute it
                _self.go2Target = function(delay) {
                    _self.defineTarget();

                    if ( _self.executeDecision() ) {
                        _self.defineQuery();
                        _self.applyDefQuery(layer.layerinfo, _self.defQueryConcat, delay);
                    }
                };

                // moving the handles
                _self.playHandles = function( e, ui ) {
                    _self.flowStatus('JUMP');
                    _self.minT(ui.values[0]);
                    _self.maxT(ui.values[1]);
                    _self.go2Target(_self.duration[0]);
                };

                // used with NUMBER format only
                // uses Inputs min and max to play table
                _self.playTable = function( minmax, vmdl, evt, ui ) {

                    _self.flowStatus('JUMP');

                    var targetMin, targetMax,
                        delta = 0;

                    if (minmax === 'min') {
                        targetMin = parseInt(evt.target.value);
                        targetMax = _self.inRSliderselmaxval();
                    } else { /*mimnmax === 'max'*/
                        targetMin = _self.inRSliderselminval();
                        targetMax = parseInt(evt.target.value);
                    }

                    if ( isNaN(targetMin) || isNaN(targetMax) ) {
                        targetMin = _self.updVals().min;
                        targetMax = _self.updVals().max;
                    }

                    targetMin = targetMin - ( targetMin % _self.intervalPrt );
                    targetMax = targetMax - ( targetMax % _self.intervalPrt );

                    if (minmax === 'min') {
                        targetMin = targetMin > targetMax ? targetMax : targetMin;
                    } else { /*mimnmax === 'max'*/
                        targetMax = targetMax < targetMin ? targetMin : targetMax;
                    }

                    delta = targetMax - targetMin;

                    if (evt.type === 'input') { // move the handles only
                        _self.updVals({min: targetMin, max: targetMax});
                        _self.minT(targetMin);
                        _self.maxT(targetMax);
                        evt.stopImmediatePropagation();
                    } else if (evt.type === 'change') { // update the map
                        _self.minT(targetMin);
                        _self.maxT(targetMax);
                        _self.go2Target(_self.duration[0]);
                    }
                };

                // stp everything
                _self.stop = function() {
                    _self.flowStatus('STOP');
                    _self.playPauseStateFWD('STOP');
                    _self.playPauseStateBWD('STOP');
                };

                // reset slider
                _self.resetSlider = function() {
                    _self.stop();
                    _self.minT(_self.minExtPrt);
                    _self.maxT(_self.maxExtPrt);
                    _self.flowStatus('JUMP');
                    _self.go2Target(_self.duration[0]);
                };

                // defining query processes chain
                _self.defineQuery = function() {
                    var defQueryNew ='';

                    defQueryNew = _self.buildDefQuery(_self.minT(), _self.maxT());
                    _self.defQueryConcat = _self.concatDefQuery(layer.layerinfo, defQueryNew, 0, false);
                };

                // build query to be passed to geospatial services
                _self.buildDefQuery = function(min, max) {
                    var defs = [],
                        defQuery = '',
                        fieldname = layer.field.data;

                    if(valueFormat === 2) { // number format
                        if ( min === max ) {
                            defQuery =  fieldname + ' = ' + min;
                        } else {
                            defQuery =  fieldname + ' >= ' + min + ' AND ' + fieldname + ' <= ' + max;
                        }
                    } else if(valueFormat === 3) { // date format
                        var minFormat, maxFormat,
                            dateTmpMin, dateTmpMax,
                            minDate = new Date(min*1000),
                            maxDate = new Date(max*1000);

                        minFormat = _self.formatDT(minDate);
                        dateTmpMin = minFormat.split('-');

                        if ( min !== max ) {
                            maxFormat = _self.formatDT(maxDate);
                            dateTmpMax = maxFormat.split('-');

                            defs.push(fieldname + ' >= DATE \'' + dateTmpMin[1] + '/' + dateTmpMin[2] + '/' + dateTmpMin[0] + ' 00:00:00\'');
                            defs.push(fieldname + ' <= DATE \'' + dateTmpMax[1] + '/' + dateTmpMax[2] + '/' + dateTmpMax[0] + ' 00:00:00\'');
                        } else {
                            defs.push(fieldname + ' = DATE \'' + dateTmpMin[1] + '/' + dateTmpMin[2] + '/' + dateTmpMin[0] + ' 00:00:00\'');
                        }
                        defQuery = defs.join(' AND ');
                    }
                    return defQuery;
                };

                // concatenate new and existing queries
                // interaction with datagridVM is still a work in progress
                // almost the same as the one in datagridVM (remove reference to table)
                _self.concatDefQuery = function(layerInfo, defQuery, nbFeatures, spatial) {
                    var iStart, iEnd, tmpStrLen,
                        queryNoId = '',
                        tmpStr = '',
                        lyrDef = '',
                        layerType = layerInfo.type,
                        layerId = layerInfo.id;

                    // get actual def query
                    lyrDef = mapVM.getDefQuery(mapid, layerId, layerType, layerInfo.index);

                    // check if query never been initialize
                    if (typeof lyrDef === 'undefined') {
                        lyrDef = '';
                    }

                    // if it is a spatial query remove spatial part then concat
                    // If not, add the spatial part then concat.
                    if (lyrDef !== '') {
                        // extract spatial part
                        iStart = lyrDef.indexOf('OBJECTID IN (');
                        if (iStart !== -1) {
                            tmpStr = lyrDef.substring(iStart, lyrDef.length);
                            iEnd = tmpStr.indexOf(')') + 1;
                            tmpStr = lyrDef.substring(iStart, iStart + iEnd);
                        } else {
                            tmpStr = '';
                        }

                        if (spatial) {
                            // remove spatial part and leading and ending AND
                            tmpStr = lyrDef.replace(tmpStr, '');
                            tmpStrLen = tmpStr.length;
                            if (tmpStr.indexOf(' AND ') === 0) {
                                tmpStr = tmpStr.substring(5, tmpStrLen);
                            }
                            if (tmpStr.lastIndexOf(' AND ') === tmpStrLen - 5) {
                                tmpStr = tmpStr.substring(0, tmpStrLen - 5);
                            }

                            queryNoId = tmpStr;
                        } else {
                            queryNoId = defQuery;
                        }

                        // combine query
                        if (tmpStr !== '' && defQuery !== '') {
                            defQuery += ' AND ' + tmpStr;
                        } else if (tmpStr !== '') {
                            defQuery = tmpStr;
                        }
                    }
                    return defQuery;
                };

                // Apply definition query with a timer for better UX
                // mostly like applyDefQuery method in datagridVM
                _self.applyDefQuery = function(layerInfo, defQuery, delay) {
                    var layerType = layerInfo.type,
                        layerId = layerInfo.id;

                    _self.intervalID = setTimeout(function() {
                        mapVM.setDefQuery(mapid, defQuery, layerId, layerType, layerInfo.index);
                    }, delay);
                };

                // pad with zero(s)
                function zeroPad(num, places) {
                  var zero = places - num.toString().length + 1;
                  return Array(+(zero > 0 && zero)).join("0") + num;
                }

                // format date eg. yyyy-mm-dd
                function formatDT(__dt) {
                    var year = __dt.getFullYear();
                    var month = _self.zeroPad(__dt.getMonth()+1, 2);
                    var date = _self.zeroPad(__dt.getDate(), 2);
                    // var hours = zeroPad(__dt.getHours(), 2);
                    // var minutes = zeroPad(__dt.getMinutes(), 2);
                    // var seconds = zeroPad(__dt.getSeconds(), 2);
                    // return year + '-' + month + '-' + date + ' ' + hours + ':' + minutes + ':' + seconds;
                    return year + '-' + month + '-' + date;
                }

                _self.init();
            };

            // put view model in an array because we can have more then one map in the page
            vm[mapid] = new toolbarrangesliderViewModel($mapElem, mapid, config);
            ko.applyBindings(vm[mapid], $mapElem[0]); // This makes Knockout get to work
            return vm;
        };
        return {
            initialize: initialize
};
    });
}).call(this);
