/// <reference path="./typings/jquery/jquery.d.ts"/>
$(document).ready(function(){
  class Cat {
    // Instance variables
    private name: string;
    private imgSrc: string;
    private numClicks: number;

    constructor(name: string, imgSrc: string) {
      this.name = name;
      this.imgSrc = imgSrc;
      this.numClicks = 0;
    }

    // Getters and setters
    getName = (): string => { return this.name; }
    setName = (name: string): void => { this.name = name; }
    getImgSrc = (): string => { return this.imgSrc; }
    setImgSrc = (imgSrc: string): void => { this.imgSrc = imgSrc; }
    getNumClicks = (): number => { return this.numClicks; }
    setNumClicks = (numClicks: number): void => { this.numClicks = numClicks; }

    // Implementation
    handleClick = (): void => { this.numClicks += 1; }
  }

  class Model {
    // Instance variables
    private catList: Cat[];
    private activeCat: Cat;

    constructor(catList: Cat[]) {
      this.catList = catList;
    }

    // Getters and setters
    getActiveCat = (): Cat => { return this.activeCat; }
    setActiveCat = (activeCat: Cat): void => { this.activeCat = activeCat; }
    getActiveNumClicks = (): number => { return this.activeCat.getNumClicks(); }
    getCatList = (): Cat[] => { return this.catList };

    // Implementation
    handleClick = (): void => this.activeCat.handleClick();
  }

  class Octopus {
    // Instance variables
    private model: Model;
    private listView: ListView;
    private displayView: DisplayView;
    private adminVisible: boolean;
    private adminView: AdminView;
    private numClicksHandle: JQuery;
    private listHandle: JQuery;
    private adminHandle: AdminViewHandles;

    constructor(model: Model, listView: ListView, displayView: DisplayView, adminView: AdminView) {
      let self = this;
      this.model = model;
      this.listView = listView;
      this.displayView = displayView;
      this.adminView = adminView;
      this.adminVisible = false;

      // Set up the model
      this.model.setActiveCat(this.model.getCatList()[0]);
      let activeCat = this.model.getActiveCat();

      // Set up the views
      this.setUpListView();     
      this.setUpDisplayView();
      this.setUpAdminView();    
    }

    // Implementation
    handleCatSelection(name: string): void {
      var cat: Cat = this.getCatByName(name);
      let self = this;
      this.model.setActiveCat(cat);      
      this.numClicksHandle = this.displayView.render(cat);
      this.numClicksHandle.click(function() { self.handleClick(); });
      this.setUpAdminView();
    }

    handleClick(): void {
      this.model.handleClick();
      let clicks = this.model.getActiveNumClicks();
      this.displayView.handleClick(clicks);
      this.adminView.handleClick(clicks);
    }

    handleAdminButtonClick(){
      this.adminVisible = !this.adminVisible;
      this.adminView.render(this.model.getActiveCat(), this.adminVisible);
    }
    
    handleNameTyping(handle: JQuery) {
      let typing: string = handle.val();
      this.displayView.changeName(typing);
    }
    
    handleClickTyping(handle: JQuery) {
      let typing: string = handle.val();
      this.displayView.changeNumClicks(typing);
    }
    
    handleAdminFormSubmission() {
      let clicks = Number(this.adminHandle.numClicksHandle.val());      
      let cat = this.model.getActiveCat();      
      if(clicks) {        
        let name = this.adminHandle.nameHandle.val();
        let url = this.adminHandle.urlHandle.val();
        cat.setName(name);
        cat.setImgSrc(url);
        cat.setNumClicks(clicks);
        this.setUpListView();
        this.setUpDisplayView();
        this.adminVisible = false;
        this.setUpAdminView();       
      } else {
        this.adminView.putTypeError();
      }
    }
    
    // Helper methods
    private setUpListView() {      
      let self = this;
      this.listHandle = this.listView.render(this.model.getCatList());
      this.listHandle.change(function() { self.handleCatSelection($(this).val()); });
    }
    
    private setUpDisplayView() {
      let self = this;     
      this.numClicksHandle = this.displayView.render(this.model.getActiveCat());
      this.numClicksHandle.find("*").off();
      this.numClicksHandle.click(function() { self.handleClick(); });
    }
    
    private setUpAdminView() {
      let activeCat = this.model.getActiveCat();
      let self = this;
      this.adminHandle = this.adminView.render(activeCat, self.adminVisible);
      this.adminHandle.adminButtonHandle.click(function() { self.handleAdminButtonClick(); });
      this.adminHandle.nameHandle.keyup(function() { self.handleNameTyping(self.adminHandle.nameHandle); });
      this.adminHandle.numClicksHandle.keyup(function() { self.handleClickTyping(self.adminHandle.numClicksHandle); });
      this.adminHandle.submitButtonHandle.click(function() { self.handleAdminFormSubmission(); }); 
    }
    
    private getCatByName(name: string): Cat {
      let counter = 0;
      let answer = null;
      while(counter < this.model.getCatList().length && !answer) {
        let cat = this.model.getCatList()[counter];
        if(cat["name"] == name) {
          answer = cat;
        }
        counter += 1;
      }
      if(answer) {
        return answer;
      } else {
        throw "getCatByName() could not find the cat";
      }
    }
  }

  class ListView {
    render(catList: Cat[]): JQuery {
      $("#cat-list").html('<select id="list"></select>');
      let handle = $("#list");
      catList.forEach(function(cat){
        let name = cat.getName();
        let html = `<option id="${name}">${name}</option>`;
        handle.append(html);
      });
      return handle;
    }
  }

  class DisplayView {

    render(cat: Cat) {
      let html = `<h2 class="name">${cat.getName()}</h2>` +
      `<img id="pic" width=400 src=${cat.getImgSrc()}>` +
      `<h3 class="clicks">${cat.getNumClicks()}</h3>`;
      $("#cat-display").html(html);
      var handle = $("#pic");
      return handle; // Register the handle here, give to controller.
    }

    handleClick(numClicks) {
      $(".clicks").html(numClicks);
    }
    
    changeName = (name: string) => { $(".name").html(name) };
    changeNumClicks = (clicks) => { $(".clicks").html(clicks) };

 
  }

  interface AdminViewHandles {
    adminButtonHandle: JQuery;
    nameHandle: JQuery;
    urlHandle: JQuery;
    numClicksHandle: JQuery;
    submitButtonHandle: JQuery;
  }

  class AdminView {
    render(cat: Cat, show: boolean) {
      let adminButtonHandle = $("button[name=admin-show]");
      let nameHandle = $("input[name=admin-name]");
      let urlHandle = $("input[name=admin-url]");
      let numClicksHandle = $("input[name=admin-clicks]");
      let submitButtonHandle = $("button[name=admin-submit]");
      nameHandle.val(cat.getName());
      urlHandle.val(cat.getImgSrc());
      numClicksHandle.val(cat.getNumClicks());
      if(!show) {
        $("#admin").hide();
      } else {
        $("#admin").show();
      }
      let listeners: AdminViewHandles = {
        adminButtonHandle: adminButtonHandle,
        nameHandle: nameHandle,
        urlHandle: urlHandle,
        numClicksHandle,
        submitButtonHandle: submitButtonHandle
      }
      return listeners;
    }

    handleClick(clicks: number) {
      $("input[name=admin-clicks]").val(clicks);
    }
    
    putTypeError = () => { $(".clicks").html("Enter a number only.") }; 
  }

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
