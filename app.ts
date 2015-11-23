/// <reference path="./typings/jquery/jquery.d.ts"/>

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
  private clickHandle: JQuery;
  private listHandle: JQuery;

  constructor(model: Model, listView: ListView, displayView: DisplayView) {
    let _this = this;
    this.model = model;
    this.listView = listView;
    this.displayView = displayView;

    // Set up the model
    this.model.setActiveCat(this.model.getCatList()[0]);

    // Set up the list view
    this.listHandle = this.listView.render(this.model.getCatList());
    this.listHandle.change(function() {
      _this.handleCatSelection(this.value);
    });

    // Set up the display view
    this.clickHandle = this.displayView.render(this.model.getActiveCat());
    this.clickHandle.click(function() {
      _this.handleClick();
    });
  }

  // Implementation
  handleCatSelection(name: string): void {
    var cat: Cat = this.getCatByName(name);
    this.model.setActiveCat(cat);
    this.listHandle = this.displayView.render(cat);
  }

  handleClick(): void {
    console.log(this.model.getActiveNumClicks());
    this.model.handleClick();
    this.displayView.handleClick(this.model.getActiveNumClicks());
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
               `<img width=400 src=${cat.getImgSrc()}>` +
               `<h3 class="clicks">${cat.getNumClicks()}</h3>`;
    var handle = $("#cat-display");
    handle.html(html);
    return handle; // Register the handle here, give to controller.
  }

  handleClick(numClicks) {
    $(".clicks").html(numClicks);
  }
}

var cat1 = new Cat("Grumpy", "http://i.dailymail.co.uk/i/pix/2014/08/05/1407225932091_wps_6_SANTA_MONICA_CA_AUGUST_04.jpg");
var cat2 = new Cat("Happy", "http://dc541.4shared.com/img/CNrXLjwN/s7/13cd1fd1a38/happy-cat.jpg");
var cat3 = new Cat("Dopey", "http://s-ak.buzzfed.com/static/enhanced/terminal01/2010/5/28/13/enhanced-buzz-7552-1275066424-6.jpg");
var cat4 = new Cat("Scary", "http://i233.photobucket.com/albums/ee173/charbo187/cute-funny-animals-30.jpg");
var cat5 = new Cat("Stuck", "https://i.ytimg.com/vi/tntOCGkgt98/maxresdefault.jpg");

var model = new Model([cat1, cat2, cat3, cat4, cat5]);
var listView = new ListView();
var displayView = new DisplayView();
var octopus = new Octopus(model, listView, displayView);
