/// <reference path="./typings/jquery/jquery.d.ts"/>
$(document).ready(function () {
    var Cat = (function () {
        function Cat(name, imgSrc) {
            var _this = this;
            // Getters and setters
            this.getName = function () { return _this.name; };
            this.setName = function (name) { _this.name = name; };
            this.getImgSrc = function () { return _this.imgSrc; };
            this.setImgSrc = function (imgSrc) { _this.imgSrc = imgSrc; };
            this.getNumClicks = function () { return _this.numClicks; };
            this.setNumClicks = function (numClicks) { _this.numClicks = numClicks; };
            // Implementation
            this.handleClick = function () { _this.numClicks += 1; };
            this.name = name;
            this.imgSrc = imgSrc;
            this.numClicks = 0;
        }
        return Cat;
    })();
    var Model = (function () {
        function Model(catList) {
            var _this = this;
            // Getters and setters
            this.getActiveCat = function () { return _this.activeCat; };
            this.setActiveCat = function (activeCat) { _this.activeCat = activeCat; };
            this.getActiveNumClicks = function () { return _this.activeCat.getNumClicks(); };
            this.getCatList = function () { return _this.catList; };
            // Implementation
            this.handleClick = function () { return _this.activeCat.handleClick(); };
            this.catList = catList;
        }
        return Model;
    })();
    var Octopus = (function () {
        function Octopus(model, listView, displayView, adminView) {
            var self = this;
            this.model = model;
            this.listView = listView;
            this.displayView = displayView;
            this.adminView = adminView;
            this.adminVisible = false;
            // Set up the model
            this.model.setActiveCat(this.model.getCatList()[0]);
            var activeCat = this.model.getActiveCat();
            // Set up the views
            this.setUpListView();
            this.setUpDisplayView();
            this.setUpAdminView();
        }
        // Implementation
        Octopus.prototype.handleCatSelection = function (name) {
            var cat = this.getCatByName(name);
            var self = this;
            this.model.setActiveCat(cat);
            //this.numClicksHandle.off();
            this.numClicksHandle = this.displayView.render(cat);
            this.numClicksHandle.click(function () { self.handleClick(); });
            console.log(this.numClicksHandle);
            this.setUpAdminView();
        };
        Octopus.prototype.handleClick = function () {
            this.model.handleClick();
            var clicks = this.model.getActiveNumClicks();
            this.displayView.handleClick(clicks);
            this.adminView.handleClick(clicks);
        };
        Octopus.prototype.handleAdminButtonClick = function () {
            this.adminVisible = !this.adminVisible;
            this.adminView.render(this.model.getActiveCat(), this.adminVisible);
        };
        Octopus.prototype.handleNameTyping = function (handle) {
            var typing = handle.val();
            this.displayView.changeName(typing);
        };
        Octopus.prototype.handleClickTyping = function (handle) {
            var typing = handle.val();
            this.displayView.changeNumClicks(typing);
        };
        Octopus.prototype.handleAdminFormSubmission = function () {
            var clicks = Number(this.adminHandle.numClicksHandle.val());
            var cat = this.model.getActiveCat();
            if (clicks) {
                var name_1 = this.adminHandle.nameHandle.val();
                var url = this.adminHandle.urlHandle.val();
                cat.setName(name_1);
                cat.setImgSrc(url);
                cat.setNumClicks(clicks);
                this.setUpListView();
                this.setUpDisplayView();
                this.adminVisible = false;
                this.setUpAdminView();
            }
            else {
                this.adminView.putTypeError();
            }
        };
        // Helper methods
        Octopus.prototype.setUpListView = function () {
            var self = this;
            this.listHandle = this.listView.render(this.model.getCatList());
            this.listHandle.change(function () { self.handleCatSelection($(this).val()); });
        };
        Octopus.prototype.setUpDisplayView = function () {
            var self = this;
            this.numClicksHandle = this.displayView.render(this.model.getActiveCat());
            console.log(this.numClicksHandle);
            this.numClicksHandle.find("*").off();
            this.numClicksHandle.click(function () { self.handleClick(); });
        };
        Octopus.prototype.setUpAdminView = function () {
            console.log("In setupAdminView()");
            var activeCat = this.model.getActiveCat();
            var self = this;
            this.adminHandle = this.adminView.render(activeCat, self.adminVisible);
            this.adminHandle.adminButtonHandle.click(function () { self.handleAdminButtonClick(); });
            this.adminHandle.nameHandle.keyup(function () { self.handleNameTyping(self.adminHandle.nameHandle); });
            this.adminHandle.numClicksHandle.keyup(function () { self.handleClickTyping(self.adminHandle.numClicksHandle); });
            this.adminHandle.submitButtonHandle.click(function () { self.handleAdminFormSubmission(); });
        };
        Octopus.prototype.getCatByName = function (name) {
            var counter = 0;
            var answer = null;
            while (counter < this.model.getCatList().length && !answer) {
                var cat = this.model.getCatList()[counter];
                if (cat["name"] == name) {
                    answer = cat;
                }
                counter += 1;
            }
            if (answer) {
                return answer;
            }
            else {
                throw "getCatByName() could not find the cat";
            }
        };
        return Octopus;
    })();
    var ListView = (function () {
        function ListView() {
        }
        ListView.prototype.render = function (catList) {
            $("#cat-list").html('<select id="list"></select>');
            var handle = $("#list");
            catList.forEach(function (cat) {
                var name = cat.getName();
                var html = "<option id=\"" + name + "\">" + name + "</option>";
                handle.append(html);
            });
            return handle;
        };
        return ListView;
    })();
    var DisplayView = (function () {
        function DisplayView() {
            this.changeName = function (name) { $(".name").html(name); };
            this.changeNumClicks = function (clicks) { $(".clicks").html(clicks); };
        }
        DisplayView.prototype.render = function (cat) {
            var html = ("<h2 class=\"name\">" + cat.getName() + "</h2>") +
                ("<img id=\"pic\" width=400 src=" + cat.getImgSrc() + ">") +
                ("<h3 class=\"clicks\">" + cat.getNumClicks() + "</h3>");
            $("#cat-display").html(html);
            var handle = $("#pic");
            return handle; // Register the handle here, give to controller.
        };
        DisplayView.prototype.handleClick = function (numClicks) {
            $(".clicks").html(numClicks);
        };
        return DisplayView;
    })();
    var AdminView = (function () {
        function AdminView() {
            this.putTypeError = function () { $(".clicks").html("Enter a number only."); };
        }
        AdminView.prototype.render = function (cat, show) {
            var adminButtonHandle = $("button[name=admin-show]");
            var nameHandle = $("input[name=admin-name]");
            var urlHandle = $("input[name=admin-url]");
            var numClicksHandle = $("input[name=admin-clicks]");
            var submitButtonHandle = $("button[name=admin-submit]");
            nameHandle.val(cat.getName());
            urlHandle.val(cat.getImgSrc());
            numClicksHandle.val(cat.getNumClicks());
            if (!show) {
                $("#admin").hide();
            }
            else {
                $("#admin").show();
            }
            var listeners = {
                adminButtonHandle: adminButtonHandle,
                nameHandle: nameHandle,
                urlHandle: urlHandle,
                numClicksHandle: numClicksHandle,
                submitButtonHandle: submitButtonHandle
            };
            return listeners;
        };
        AdminView.prototype.handleClick = function (clicks) {
            $("input[name=admin-clicks]").val(clicks);
        };
        return AdminView;
    })();
    var cat1 = new Cat("Grumpy", "http://i.dailymail.co.uk/i/pix/2014/08/05/1407225932091_wps_6_SANTA_MONICA_CA_AUGUST_04.jpg");
    var cat2 = new Cat("Happy", "http://dc541.4shared.com/img/CNrXLjwN/s7/13cd1fd1a38/happy-cat.jpg");
    var cat3 = new Cat("Dopey", "http://s-ak.buzzfed.com/static/enhanced/terminal01/2010/5/28/13/enhanced-buzz-7552-1275066424-6.jpg");
    var cat4 = new Cat("Scary", "http://i233.photobucket.com/albums/ee173/charbo187/cute-funny-animals-30.jpg");
    var cat5 = new Cat("Stuck", "https://i.ytimg.com/vi/tntOCGkgt98/maxresdefault.jpg");
    var model = new Model([cat1, cat2, cat3, cat4, cat5]);
    var listView = new ListView();
    var displayView = new DisplayView();
    var adminView = new AdminView();
    new Octopus(model, listView, displayView, adminView);
});
