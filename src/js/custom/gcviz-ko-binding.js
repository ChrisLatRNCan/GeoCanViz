/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * hold custom Knockout binding
 */
/* global vmArray: false, dojo: false */
(function() {
	'use strict';
	define(['jquery-private',
			'knockout',
			'dijit/form/HorizontalSlider',
			'dijit/form/RadioButton',
			'jqueryui'
	], function($viz, ko, slider, radio) {

    ko.bindingHandlers.tooltip = {
		init: function(element, valueAccessor) {
			var local = ko.utils.unwrapObservable(valueAccessor()),
				options = {},
				$element = $viz(element);

			ko.utils.extend(options, ko.bindingHandlers.tooltip.options);
			ko.utils.extend(options, local);

			$element.attr('title', options.content);
			$element.tooltip(options);

			ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
					$element.tooltip('destroy');
				});
			},
			options: {
				show: {
					effect: 'slideDown',
					delay: 2000
				},
				hide: {
					effect: 'slideUp',
					delay: 100
				},
				position: {
					my: 'right+30 top+5'
				},
				tooltipClass: 'gcviz-tooltip',
				trigger: 'hover, focus'
			}
	};

	ko.bindingHandlers.fullscreen = {
		init: function(element, valueAccessor, allBindings, viewModel) {
			var manageFullscreen,
				mapid = viewModel.mapid,
				vm = vmArray[mapid].header;
			vm.isFullscreen.subscribe(manageFullscreen);

			manageFullscreen = function(fullscreen) {
				if (fullscreen) {
					viewModel.enterFullscreen(vm.widthSection, vm.heightSection);
				} else {
					viewModel.exitFullscreen();
				}
			};
		}
	};

	ko.bindingHandlers.insetVisibility = {
		init: function(element, valueAccessor, allBindings, viewModel) {
			var manageInsetVisibility,
				mapid = viewModel.mapid,
				vm = vmArray[mapid].header;
			vm.isInsetVisible.subscribe(manageInsetVisibility);

			manageInsetVisibility = function(visible) {
				viewModel.setVisibility(visible);
			};
		}
	};

	ko.bindingHandlers.enterkey = {
		init: function(element, valueAccessor, allBindings, viewModel) {
			// get function name to call from the binding
			var func = valueAccessor().func,
				keyType = valueAccessor().keyType;

			ko.utils.registerEventHandler(element, keyType, function(event) {
				if (viewModel[func](event.which, event.shiftKey, event.type)) {
					event.preventDefault();
					return false;
				}
				return true;
			});
		}
	};

	ko.bindingHandlers.HorizontalSliderDijit = {
        init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
			var options = valueAccessor(),
				id = viewModel.id,
				type = viewModel.type,
				widget;

			if (options.enable) {
				$viz(element).attr('Visible', options.visible);
				widget = new slider({
					name: 'slider',
	                minimum: options.extent[0],
	                maximum: options.extent[1],
	                intermediateChanges: true,
	                value: options.value,
	                showButtons: false
				}).placeAt(element);
	
				// set initstate opacity
				if(viewModel.items.length === 0) {
					bindingContext.$root.changeServiceOpacity(id, options.value);
				} else {
					loopChildren(viewModel, options.value, loopChildren);
				}
				
				dojo.addClass(widget.domNode, 'gcviz-legendSlider');
	
				widget.on('Change', function(e) {
	
					if(viewModel.items.length === 0) {
						bindingContext.$root.changeServiceOpacity(id, e);
					} else {
						loopChildren(viewModel, e, loopChildren);
					}
				});
			}

			function loopChildren(VM, e) {
				if (VM.items.length > 0) {
					Object.keys(VM.items).forEach(function(key) {
						loopChildren(VM.items[key], e, loopChildren);
					});
				}
				else {
					bindingContext.$root.changeServiceOpacity(VM.id, e);
				}
			}
		}
	};

	ko.bindingHandlers.legendItemList = {
		init: function(element, valueAccessor, allBindings, viewModel) {
			var options = valueAccessor(),
				$element = $viz(element);

			if (viewModel.items.length > 0) {
				$element.children('div#childItems.gcviz-legendHolderDiv').toggle(options.expanded, function(event) {
					event.stopPropagation();
				});
			} else {
				$element.children('.gcviz-legendSymbolDiv').toggle(options.expanded);
				$element.children('div#customImage.gcviz-legendHolderImgDiv').toggle(options.expanded);
			}
			
			if (viewModel.displaychild.enable === false && viewModel.customimage.enable === false) { //remove bullet symbol
				$element.css('background-image', 'none');
			}

			return false;
		}
	};

	ko.bindingHandlers.LegendRadioButtons = {
		init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
			var options = valueAccessor(),
				widget;

			widget = new radio({
				name: options.group,
                value: options.value,
                checked: options.value
            }).placeAt(element);

			widget.on('Change', function(e) {
				bindingContext.$root.switchRadioButtonVisibility(bindingContext.$root.mymap, viewModel.id, e);
			});
		}
	};

	});
}).call(this);
