/**
 * A module which defines the contractual item for graduate student insurance
 * @module app/graduateinsuranceitem
 */
define(["jquery", "app/utils"], function(jquery, utils){
    "use strict"

    /**
     * Type which defines the contractual item for graduate student insurance
     * @alias module:app/graduateinsuranceitem
     *
     * @param {DOM Element} elem - The element to fill with this item
     * @param {ContractWidget} widget - The widget owning this element
     * @param {Moment} start - Start time of this item
     * @param {Moment} end - End time of this item
     * @param {object} config - Restore this item from the given config
     */
    var GraduateInsuranceItem = function(elem, widget, start, end, config) {
        this.parent = widget;
        this.start = start;
        this.end = end;
        this.body = $("<div>")
            .load("bodies/graduateinsuranceitem.html",
                  null,
                  function(){
                      this.init();
                      this.updateDuration(start, end);
                      if (config)
                          this.restore(config);
                  }.bind(this));
        elem.append(this.body);
        return this;
    }

    // No item name hides this item types
    GraduateInsuranceItem.prototype.itemName = "";

    /**
     * Initialize this item. This function will be invoked after the body
     * div has been populated but before it is inserted into the DOM.
     */
    GraduateInsuranceItem.prototype.init = function() {
        $(document.body).on("graduate-added", function(){
            this.update();
            this.parent.update();
        }.bind(this));
    }

    /**
     * Get an object which can be used to restore this item to a prior state
     */
    GraduateInsuranceItem.prototype.save = function() {
        return {};
    }

    /**
     * Restore this item to the state specified by 'config'
     *
     * @param {object} config - The configuration object
     */
    GraduateInsuranceItem.prototype.restore = function(config) {
        this.update();
    }

    GraduateInsuranceItem.prototype.getInsuranceCost = function(year) {
        var fixedCosts = {
            2015 : 74,
            2016 : 85,
            2017 : 89,
            2018 : 94,
            2019 : 98
        }

        var year = this.start.year() + year;

        if (fixedCosts[year]) {
            console.log("fixed");
            return fixedCosts[year];
        } else {
            var years = year - 2019;
            return 98 * Math.pow(1.05, years);
        }
    }

    GraduateInsuranceItem.prototype.update = function() {
        var count = $(".graduate-student").length;
        this.body.find(".graduate-insurance-count").val(count);

        var years = this.body.find('.year');
        var self = this;
        years.map(function(i){
            $(this).text(utils.asCurrency(count*self.getInsuranceCost(i)*12));
        });
        var total = _.reduce(years,
                             function(total, e){
                                 return total + parseFloat($(e).text());
                             }, 0);
        this.body.find('.total').text(utils.asCurrency(total));
    }

    /**
     * Make this item able to represent the duration start-end
     *
     * @param {Moment} start - New start time of the item
     * @param {Moment} end - New end time of the item
     */
    GraduateInsuranceItem.prototype.updateDuration = function(start, end) {
        this.start = start;
        this.end = end;

        var years = Math.ceil(end.diff(start, 'years', true));
        while(this.body.find(".year").length != years) {
            if (this.body.find(".year").length > years) {
                this.removeYear();
            } else {
                this.addYear();
            }
        }
        this.update();
        this.parent.update();
    }

    /**
     * Add a year to this item's display
     */
    GraduateInsuranceItem.prototype.addYear = function() {
        var year = this.body.find(".year").length;
        var newYear = $.parseHTML(
            '<tr class="row">' +
                '<td class="col-sm-4">Year ' + (year+1) + '</td>' +
                '<td class="col-sm-4">$<span class="year currency">0.00</></td>' +
            '</tr>'
        );
        $(newYear).insertBefore(this.body.find(".salary-totals .row:last"));
    }

    /**
     * Remove a year from this item's display
     */
    GraduateInsuranceItem.prototype.removeYear = function() {
        this.body.find(".salary-totals .row").eq(-2).remove();
    }

    /**
     * Get the current costs for each year from this item.
     *
     * @returns {Number[]} - An array of numbers, one for each year
     */
    GraduateInsuranceItem.prototype.val = function() {
        var out = [];
        this.body.find(".year").map(function(){
            out.push(parseFloat($(this).html()));
        });
        return out;
    }

    /**
     * Convert this item to an array suitable for being passed to excel-builder
     */
    GraduateInsuranceItem.prototype.serialize = function() {
        return [];
    }

    return GraduateInsuranceItem;
});
