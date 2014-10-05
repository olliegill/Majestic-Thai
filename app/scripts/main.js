/* global Backbone, _, $ */
'use strict';

var Food = Backbone.Model.extend({
  defaults: {
    item: "",
    price: "",
    description: "",
    //isCheckoutOut: false
  },
  firebase: new Backbone.Firebase("https://amber-inferno-7725.firebaseio.com/food")
});

var Order = Backbone.Model.extend({
  firebase: new Backbone.Firebase("https://amber-inferno-7725.firebaseio.com/orders"),
   defaults: {
     lineItems: [],
     price: ""
   }
});

var FoodCollection = Backbone.Firebase.Collection.extend({
  model: Food,
  firebase: "https://amber-inferno-7725.firebaseio.com/food"
});

var FoodView = Backbone.View.extend({
  tagName: 'li',
  className: 'menu-li',               //turn below into a script in html.
  template: _.template('<span class="item-name"><%= item %></span> <br/><%= description %><button class="delete">DELETE</button><button class="order">ORDER</button><span class="item-price"><%= price %><span>'),

  initialize: function(options){
    options = options || {};
    this.listenTo(this.model, 'destroy', this.remove);
    this.currentOrder = options.currentOrder;
  },

  events: {
    'click .order': 'orderFood',
    'click .delete': 'deleteFood'
  },

  orderFood: function(){
    console.log(this.currentOrder);
    var lineItems = this.currentOrder.get('lineItems');
    lineItems.push(this.model.get("item"));
    this.currentOrder.set('lineItems', lineItems);  //look here
    this.currentOrder.set('price', '20');
    console.log(this.currentOrder);
  },

  deleteFood: function(){
    this.model.destroy();
  },

  render: function(){
    this.$el.html(this.template(this.model.attributes));
  }

});

var MenuListView = Backbone.View.extend({
  tagName: 'ul',
  className: 'food-list',
  initialize: function(options){
    options = options || {};
    this.$container = options.$container;

    this.$container.append(this.el);
    this.listenTo(this.collection, 'sync', this.render);
    this.listenTo(this.collection, 'add', this.renderChild);
    this.currentOrder = options.currentOrder;
  },

  render: function(){
    this.$el.empty();
    this.collection.each(_.bind(this.renderChild, this));
  },

  renderChild: function(food){
    var foodView = new FoodView({model: food, currentOrder: this.currentOrder});
    foodView.render();
    this.$el.append(foodView.el);

  }
});

var CreateFoodView = Backbone.View.extend({
  template: _.template($('#templates-create-food').text()),
  className: "create-food",
  attributes: {
    type: "text"
  },

  events: {
    'keyup': 'addToMenu'
  },

  addToMenu: function(event){
    if(event.keyCode === 13){
      var item = this.$('.item').val();
      var price = this.$('.price').val();
      var description = this.$('.description').val();
      var food = this.collection.create({item: item, price: price, description: description});
    }
  },

  render: function(){
    this.$el.html(this.template());
    $('.menu').append(this.el);
  }
});

var CreateOrderView = Backbone.View.extend({
  template: _.template($('#templates-order-food').text()),
  //template: _.template('<%= item %>: <%= price %>'),
  tagName: 'ul',
  className: "order-list",
  attributes: {
    type: "text"
  },


  initialize: function(options){
    options = options || {};
    this.$container = options.$container;
    //this.model.attributes.lineItems;
    this.$container.append(this.el);
    this.listenTo(this.model, 'change', this.render);
    this.render();
  },

  render: function(){
    console.log("Create order");
  var items;
 var eachItem = _.each(this.model.get("lineItems"), function(item){
    items += "<li>"+item+"</li>";
 });
 this.model.set("itemList", items);
    this.$el.html(this.template(this.model.attributes));

  }
});

$(document).ready(function(){
  var items = new FoodCollection();

  var order = new Order({

  });

  var createFoodView = new CreateFoodView({collection: items});
  createFoodView.render();

  var menuListView = new MenuListView({
    $container: $('.menu'),
    collection: items,
    currentOrder: order
  });

  var orderView = new CreateOrderView({
    model: order,
    $container: $('.order-sidebar'),


  });
});
