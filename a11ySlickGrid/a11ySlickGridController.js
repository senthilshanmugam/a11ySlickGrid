angular.module('a11yModule')
    .controller('a11ySlickGridController', ['$scope', function ($scope) {
        
        var grid;
        var columns = [
          { id: "title", name: "Title", field: "title", editor: Slick.Editors.Text, ariaAttr: TitleAria, columnHeader: true, sortable: true },
          { id: "duration", name: "Duration", field: "duration", rowHeader: [0], columnHeader: true, sortable: true },
          { id: "%", name: "% Complete", field: "percentComplete", ariaAttr: PercentCompleteAria, rowHeader: [0, 1], sortable: true },
          { id: "start", name: "Start", field: "start", ariaAttr: DateAria, columnHeader: 'Start Date', sortable: true },
          { id: "finish", name: "Finish", field: "finish", columnHeader: true },
          { id: "effort-driven", name: "Effort Driven", field: "effortDriven", columnHeader: 'Effort Driven', rowHeader: [6], ariaAttr: EffortDrivenAria },
          { id: "range", name: "Range", width: 120, formatter: NumericRangeFormatter, editor: NumericRangeEditor, ariaAttr: RangeAria, rowHeader: [0, 2], columnHeader: true }
        ];

        var fullMonth = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        var daySuffix = ['', 'st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th', 'th', 'th', 'th', 'th', 'th', 'th', 'th', 'th', 'th', 'th', 'th', 'th', 'st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th', 'th', 'th', 'st'];

        function TitleAria(row, cell, value, columnDef, dataContext) {
            if (value == null) return null;
            return { "attr": "aria-label", "value": "row header, " + value };
        }

        function PercentCompleteAria(row, cell, value, columnDef, dataContext) {
            if (value == null) return null;
            return { "attr": "aria-label", "value": value + " Percent Complete" };
        }

        function EffortDrivenAria(row, cell, value, columnDef, dataContext) {
            return { "attr": "aria-label", "value": "Range from " + dataContext.from + " to " + dataContext.to + (dataContext.effortDriven ? " Yes" : " No") };
        }

        function RangeAria(row, cell, value, columnDef, dataContext) {
            return { "attr": "aria-label", "value": "from: " + dataContext.from + " to: " + dataContext.to };
        }

        function NumericRangeFormatter(row, cell, value, columnDef, dataContext) {
            return dataContext.from + " - " + dataContext.to;
        }

        function NumericRangeEditor(args) {
            var $from, $to;
            var scope = this;

            this.init = function () {
                $from = $("<INPUT aria-label='" + args.column.id + " from ' type=text style='width:40px' />")
                    .appendTo(args.container)
                    .bind("keydown", scope.handleKeyDown);

                $(args.container).append("<span aria-hidden='true'>&nbsp; to &nbsp;</span>");

                $to = $("<INPUT aria-label='" + args.column.id + " to ' type=text style='width:40px' />")
                    .appendTo(args.container)
                    .bind("keydown", scope.handleKeyDown);

                scope.focus();
            };

            this.handleKeyDown = function (e) {
                if (e.keyCode == $.ui.keyCode.LEFT || e.keyCode == $.ui.keyCode.RIGHT || e.keyCode == $.ui.keyCode.TAB) {
                    e.stopImmediatePropagation();
                }
            };

            this.destroy = function () {
                $(args.container).empty();
            };

            this.focus = function () {
                $from.focus();
            };

            this.serializeValue = function () {
                return { from: parseInt($from.val(), 10), to: parseInt($to.val(), 10) };
            };

            this.applyValue = function (item, state) {
                item.from = state.from;
                item.to = state.to;
            };

            this.loadValue = function (item) {
                $from.val(item.from);
                $to.val(item.to);
            };

            this.isValueChanged = function () {
                return args.item.from != parseInt($from.val(), 10) || args.item.to != parseInt($to.val(), 10);
            };

            this.validate = function () {
                if (isNaN(parseInt($from.val(), 10)) || isNaN(parseInt($to.val(), 10))) {
                    return { valid: false, msg: "Please type in valid numbers." };
                }

                if (parseInt($from.val(), 10) > parseInt($to.val(), 10)) {
                    return { valid: false, msg: "'from' cannot be greater than 'to'" };
                }

                return { valid: true, msg: null };
            };

            this.init();
        }

        function DateAria(row, cell, value, columnDef, dataContext) {
            if (value == null) return null;
            var dateObj = new Date(value);
            var dateStr = fullMonth[dateObj.getMonth()] + " " + dateObj.getDate() + daySuffix[dateObj.getDate()] + ", " + dateObj.getFullYear();
            //console.log(dateStr);
            return { "attr": "aria-label", "value": dateStr };
        }

        for (var i = 0; i < 4; i++) {
            columns[i].header = {
                menu: {
                    items: [
                      {
                          iconImage: "images/sort-asc.gif",
                          title: "Sort Ascending",
                          command: "sort-asc"
                      },
                      {
                          iconImage: "images/sort-desc.gif",
                          title: "Sort Descending",
                          command: "sort-desc"
                      },
                      {
                          title: "Hide Column",
                          command: "hide",
                          disabled: true,
                          tooltip: "Can't hide this column"
                      },
                      {
                          iconCssClass: "icon-help",
                          title: "Help",
                          command: "help"
                      }
                    ]
                }
            };
        }

        // columns[0]


        var options = {
            enableColumnReorder: false,
            editable: true,
            enableAddRow: false,
            enableCellNavigation: true,
            asyncEditorLoading: false,
            autoEdit: false,
            ariaDescribedBy: "grid-description"
        };

        $(function () {
            var data = [];
            for (var i = 0; i < 500; i++) {
                var day = i % 31 + 1;
                data[i] = {
                    title: "Task " + i,
                    duration: "5 days",
                    percentComplete: Math.round(Math.random() * 100),
                    start: "01/" + day + "/2009",
                    finish: "01/" + day + "/2009",
                    effortDriven: (i % 5 == 0),
                    from: Math.round(Math.random() * 100),
                    to: Math.round(Math.random() * 100)
                };
            }

            ///////////////////////////////////
            var items = [], indices, isAsc = true, currentSortCol = { id: "title" }, i;
            function randomize(items) {
                var randomItems = $.extend(true, null, items), randomIndex, temp, index;
                for (index = items.length; index-- > 0;) {
                    randomIndex = Math.round(Math.random() * items.length - 1);
                    if (randomIndex > -1) {
                        temp = randomItems[randomIndex];
                        randomItems[randomIndex] = randomItems[index];
                        randomItems[index] = temp;
                    }
                }
                return randomItems;
            }

            for (i = 500; i-- > 0;) {
                items[i] = i;
            }
            indices = { title: items, duration: randomize(items), '%': randomize(items), start: randomize(items) };

            // Define function used to get the data and sort it.
            function getItem(index) {
                return isAsc ? data[indices[currentSortCol.id][index]] : data[indices[currentSortCol.id][(data.length - 1) - index]];
            }
            function getLength() {
                return data.length;
            }
            grid = new Slick.Grid("#myGrid", { getLength: getLength, getItem: getItem }, columns, options);

           //////////////////////////////

            //grid = new Slick.Grid("#myGrid", data, columns, options);

            var headerMenuPlugin = new Slick.Plugins.HeaderMenu({});

            headerMenuPlugin.onBeforeMenuShow.subscribe(function (e, args) {
                var menu = args.menu;

                // We can add or modify the menu here, or cancel it by returning false.
                ////var i = menu.items.length;
                ////menu.items.push({
                ////  title: "Menu item " + i,
                ////  command: "item" + i
                ////});
                //args.grid.setIsHeaderMenuVisible(true);
            });

            headerMenuPlugin.onCommand.subscribe(function (e, args) {
                if (args.command === "sort-asc" || args.command === "sort-desc") {
                    grid.onSort.notify({
                        multiColumnSort: false,
                        sortCol: args.column,
                        sortAsc: (args.command == "sort-asc"), // sortOpts.sortAsc,
                        grid: grid
                    }, e, grid);
                }
                else {
                    $("#first").val(args.command);
                    $("#first").focus();
                    setTimeout(function () {
                        grid.focus();
                    }, 5000);
                }
                //args.grid.setIsHeaderMenuVisible(false);
            });
            //grid.setHeaderMenuPlugin(headerMenuPlugin);
            grid.registerPlugin(headerMenuPlugin);

            grid.onSort.subscribe(function (e, args) {
                currentSortCol = args.sortCol;
                isAsc = args.sortAsc;
                grid.invalidateAllRows();
                grid.render();
                grid.setSortColumn(args.sortCol.id, args.sortAsc);
                setTimeout(function () {
                    grid.setActiveCell(0, 0);
                    grid.focus();
                }, 100);
            });

            grid.onCellChange.subscribe(function (e, args) {
                args.item.duration = Math.abs(args.item.from - args.item.to) + " days";
                args.item.percentComplete = Math.abs(args.item.from - args.item.to) % 100;
                args.grid.updateRow(args.row);
                setTimeout(function () {
                    args.grid.flashCell(args.row, 1, 300);
                    args.grid.flashCell(args.row, 2, 300);
                    args.grid.flashCell(args.row, 3, 300);
                }, 100);


            });

            //setTimeout(function () {
            //    grid.setActiveCell(400, 3);
            //    grid.focus();
            //}, 1000);

            //$('#addNewRow').on('click',
            //function AddNewRow() {
            //    data.push({});
            //    grid.updateRowCount();
            //    grid.render();
            //});//.on('focus', function () { $('#third').attr('taindex', 0); });

            //$('#third').on('focus', function () { grid.focus(); }).on('blur', function () { $(this).attr('tabindex', '-1') });
        })















    }]);