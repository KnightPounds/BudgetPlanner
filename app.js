// For any third party dependencies, like jQuery, place them in the lib folder.

// Configure loading modules from the lib directory,
// except for 'app' ones, which are in a sibling
// directory.
requirejs.config({
    baseUrl: 'js/lib',
    paths: {
        // All application files can be required with 'app/<name>'
        app: '../app'
    },
});

require(["excel-builder", "app/settingswidget", "app/totalswidget",
         "app/salarywidget", "app/equipmentwidget", "app/contractwidget"],
function (EB, SettingsWidget, TotalsWidget, SalaryWidget, EquipmentWidget,
                  ContractWidget) {
    var widgets = {};
    var settings = null;
    var totals = null;

    var download = function() {
        var artistWorkbook = EB.createWorkbook();
        var albumList = artistWorkbook.createWorksheet();
        var stylesheet = artistWorkbook.getStyleSheet();

        var content = [settings.serialize(), [""]];
        for (var name in widgets) {
            var widget = widgets[name];
            content.push(widget.serialize());
            content.push([""]);
        }
        content.push(totals.serialize());

        var merged = [];
        merged = merged.concat.apply(merged, content);

        albumList.setData(merged);
        artistWorkbook.addWorksheet(albumList);

        albumList.setColumns([
            {width: 3},
            {width: 13},
            {width: 13}
        ]);

        $("<a>").attr({
            download: "file.xlsx",
            href: 'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,' +
                EB.createFile(artistWorkbook)
        })[0].click();
    }

    save = function() {
        var config = {};
        for (var key in widgets) {
            if (key !== "totals") {
                config[key] = widgets[key].save();
            }
        }

        $.post("save.php", {
            id : location.search.split('id=')[1],
            data : JSON.stringify(config)
        }, function(data){
            console.log("saved");
        });

        return config;
    }

    restore = function(config) {
        widgets["settings"].restore(config["settings"]);
        for (var key in config) {
            if (key !== "totals" && key !== "settings") {
                widgets[key].restore(config[key]);
            }
        }

        setTimeout(function(){
            totals.update();
        }, 1000);
    }

    $(document).ready(function() {
        widgets = {
            "salary" : new SalaryWidget($(".container")),
            "equipment" : new EquipmentWidget($(".container")),
            "contract" : new ContractWidget($(".container")),
        };
        settings = new SettingsWidget($(".container"), widgets);
        totals = new TotalsWidget($(".container"), widgets);

        widgets["settings"] = settings;

        $(document).on("change keyup click", function(){
            var start = $("#settings-start-date").val();
            var end = $("#settings-end-date").val()
            if (!start || !end) {
                return;
            }
            totals.update();
        })

        window.onbeforeunload = function(){
            return 'Any unsaved changes will be lost.';
        };

        $("#download").click(download);
        $("#save").click(function(e){
            e.preventDefault();
            save();
        });

        // Try to restore with this ID, do nothing otherwise
        setTimeout(function(){
            $.get("restore.php", {
                id : location.search.split('id=')[1],
            }, function(data){
                if (JSON.parse(data)) {
                    restore(JSON.parse(JSON.parse(data)));
                }
            });
        }, 400);
    });
});
