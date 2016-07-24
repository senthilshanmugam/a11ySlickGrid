(function ($) {
    // register namespace
    $.extend(true, window, {
        "Slick": {
            "Plugins": {
                "HeaderMenu": HeaderMenu
            }
        }
    });


    /***
     * A plugin to add drop-down menus to column headers.
     *
     * USAGE:
     *
     * Add the plugin .js & .css files and register it with the grid.
     *
     * To specify a menu in a column header, extend the column definition like so:
     *
     *   var columns = [
     *     {
     *       id: 'myColumn',
     *       name: 'My column',
     *
     *       // This is the relevant part
     *       header: {
     *          menu: {
     *              items: [
     *                {
     *                  // menu item options
     *                },
     *                {
     *                  // menu item options
     *                }
     *              ]
     *          }
     *       }
     *     }
     *   ];
     *
     *
     * Available menu options:
     *    tooltip:      Menu button tooltip.
     *
     *
     * Available menu item options:
     *    title:        Menu item text.
     *    disabled:     Whether the item is disabled.
     *    tooltip:      Item tooltip.
     *    command:      A command identifier to be passed to the onCommand event handlers.
     *    iconCssClass: A CSS class to be added to the menu item icon.
     *    iconImage:    A url to the icon image.
     *
     *
     * The plugin exposes the following events:
     *    onBeforeMenuShow:   Fired before the menu is shown.  You can customize the menu or dismiss it by returning false.
     *        Event args:
     *            grid:     Reference to the grid.
     *            column:   Column definition.
     *            menu:     Menu options.  Note that you can change the menu items here.
     *
     *    onCommand:    Fired on menu item click for buttons with 'command' specified.
     *        Event args:
     *            grid:     Reference to the grid.
     *            column:   Column definition.
     *            command:  Button command identified.
     *            button:   Button options.  Note that you can change the button options in your
     *                      event handler, and the column header will be automatically updated to
     *                      reflect them.  This is useful if you want to implement something like a
     *                      toggle button.
     *
     *
     * @param options {Object} Options:
     *    buttonCssClass:   an extra CSS class to add to the menu button
     *    buttonImage:      a url to the menu button image (default '../images/down.gif')
     * @class Slick.Plugins.HeaderButtons
     * @constructor
     */
    function HeaderMenu(options) {
        var _grid;
        var _self = this;
        var _handler = new Slick.EventHandler();
        var _defaults = {
            buttonCssClass: null,
            buttonImage: null
        };
        var $menu;
        var $activeHeaderColumn;
        var $menuButton;


        function init(grid) {
            options = $.extend(true, {}, _defaults, options);
            _grid = grid;
            _handler
              .subscribe(_grid.onHeaderCellRendered, handleHeaderCellRendered)
              .subscribe(_grid.onBeforeHeaderCellDestroy, handleBeforeHeaderCellDestroy);

            // Force the grid to re-render the header now that the events are hooked up.
            _grid.setColumns(_grid.getColumns());

            // Hide the menu on outside click.
            $(document.body).bind("mousedown", handleBodyMouseDown);
        }


        function destroy() {
            _handler.unsubscribeAll();
            $(document.body).unbind("mousedown", handleBodyMouseDown);
        }


        function handleBodyMouseDown(e) {
            if ($menu && $menu[0] != e.target && !$.contains($menu[0], e.target)) {
                hideMenu();
            }
        }


        function hideMenu() {
            if ($menu) {
                $menu.remove();
                $menu = null;
                $activeHeaderColumn
                  .removeClass("slick-header-column-active");
                // Aria
                $menuButton.removeAttr('aria-owns').removeAttr('aria-activedescendant');
            }
        }

        function handleHeaderCellRendered(e, args) {
            var column = args.column;
            var menu = column.header && column.header.menu;

            if (menu) {
                var $el = $("<div></div>")
                    .addClass("slick-header-menubutton")
                    .data("column", column)
                    .data("menu", menu)
                    .attr("tabindex", "-1");

                if (options.buttonCssClass) {
                    $el.addClass(options.buttonCssClass);
                }

                if (options.buttonImage) {
                    $el.css("background-image", "url(" + options.buttonImage + ")");
                }

                if (menu.tooltip) {
                    $el.attr("title", menu.tooltip);
                }

                $el
                  .bind("click", showMenu)
                  .bind("keydown", handleMenuKeyDown)
                  .appendTo(args.node);
            }
        }


        function handleBeforeHeaderCellDestroy(e, args) {
            var column = args.column;

            if (column.header && column.header.menu) {
                $(args.node).find(".slick-header-menubutton").remove();
            }
        }


        function showMenu(e) {
            $menuButton = $(this);
            //.attr('tabindex', '-1');
            var menu = $menuButton.data("menu");
            var columnDef = $menuButton.data("column");

            // Let the user modify the menu or cancel altogether,
            // or provide alternative menu implementation.
            if (_self.onBeforeMenuShow.notify({
                "grid": _grid,
                "column": columnDef,
                "menu": menu
            }, e, _self) == false) {
                return;
            }


            if (!$menu) {
                $menu = $("<div class='slick-header-menu' id='slick-header-menu-id' role='menu' ></div>")
                  .appendTo(_grid.getContainerNode());
            }
            $menu.empty();


            // Construct the menu items.
            for (var i = 0; i < menu.items.length; i++) {
                var item = menu.items[i];

                var $li = $("<div class='slick-header-menuitem' role='menuitem' id='slick-header-menu-item-id-" + i + "'></div>")
                  .data("command", item.command || '')
                  .data("column", columnDef)
                  .data("item", item)
                  .bind("click", handleMenuItemClick)
                  .appendTo($menu);

                if (item.disabled) {
                    $li.addClass("slick-header-menuitem-disabled");
                }

                if (item.tooltip) {
                    $li.attr("title", item.tooltip);
                }

                var $icon = $("<div class='slick-header-menuicon'></div>")
                  .appendTo($li);

                if (item.iconCssClass) {
                    $icon.addClass(item.iconCssClass);
                }

                if (item.iconImage) {
                    $icon.css("background-image", "url(" + item.iconImage + ")");
                }

                $("<span class='slick-header-menucontent'></span>")
                  .text(item.title)
                  .appendTo($li);
            }

            function offsetClosure(thisObj) {
                setTimeout(function () {
                    // Position the menu.
                    $menu.offset({ top: thisObj.offset().top + thisObj.height(), left: thisObj.offset().left });
                    thisObj.focus();
                }, 0);
            };
            offsetClosure($(this));
            $menu.find('.slick-header-menuitem').eq(0).addClass('active');
            $menuButton.attr('aria-owns', 'slick-header-menu-id').attr('aria-activedescendant', 'slick-header-menu-item-id-0');

            // Mark the header as active to keep the highlighting.
            $activeHeaderColumn = $menuButton.closest(".slick-header-column");
            $activeHeaderColumn.addClass("slick-header-column-active");
            // Stop propagation so that it doesn't register as a header click event.
            e.preventDefault();
            e.stopPropagation();
        }

        function handleMenuKeyDown(e) {
            console.log('from header plugin ' + e.which);
            var keyCode = Slick.keyCode;
            if ($menu) {
                var $headerMenu = $('.slick-header-menu');
                var $currentMenuItem = $headerMenu.find('.slick-header-menuitem.active');
                if (e.which == keyCode.UP || e.which == keyCode.DOWN) {
                    console.log('up/down ' + e.which);


                    if ($headerMenu.find('.slick-header-menuitem.active').length == 0) {
                        console.log('menu active none');
                        var firstItemToFocus = 0;
                        if (e.which == keyCode.UP) firstItemToFocus = -1;
                        $headerMenu.find('.slick-header-menuitem').eq(firstItemToFocus).addClass('active');
                    } else {
                        $currentMenuItem.removeClass('active');
                        if (e.which == keyCode.DOWN) {
                            if ($currentMenuItem.next().length) {
                                $currentMenuItem.next().addClass('active');
                            } else {
                                $headerMenu.find('.slick-header-menuitem').eq(0).addClass('active');
                            }
                        } else {
                            if ($currentMenuItem.prev().length) {
                                $currentMenuItem.prev().addClass('active');
                            } else {
                                $headerMenu.find('.slick-header-menuitem').eq(-1).addClass('active');
                            }
                        }
                    }

                    // Aria
                    var $activeHeaderMenuItem = $headerMenu.find('.slick-header-menuitem.active');
                    $menuButton.attr('aria-owns', 'slick-header-menu-id').attr('aria-activedescendant', ($activeHeaderMenuItem) ? $activeHeaderMenuItem.attr('id') : '');

                }
                if (e.which == keyCode.ESCAPE || (e.altKey && e.which == keyCode.UP)) {
                    hideMenu();
                    _grid.focus();
                }
                if (e.which == keyCode.ENTER) {
                    $currentMenuItem.click();
                }
                return;
            }
        }

        function handleMenuItemClick(e) {
            var command = $(this).data("command");
            var columnDef = $(this).data("column");
            var item = $(this).data("item");

            if (item.disabled) {
                return;
            }

            hideMenu();

            if (command != null && command != '') {
                _self.onCommand.notify({
                    "grid": _grid,
                    "column": columnDef,
                    "command": command,
                    "item": item
                }, e, _self);
            }
            //_grid.focus();

            // Stop propagation so that it doesn't register as a header click event.
            e.preventDefault();
            e.stopPropagation();
        }

        $.extend(this, {
            "init": init,
            "destroy": destroy,

            "onBeforeMenuShow": new Slick.Event(),
            "onCommand": new Slick.Event()
        });
    }
})(jQuery);
