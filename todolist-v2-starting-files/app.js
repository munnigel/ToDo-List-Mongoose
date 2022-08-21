//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// THIS IS THE OLD METHOD WITHUOT MONGOOSE, IT DOES NOT PERSIST
// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

//now with mongoose
mongoose.connect("mongodb://0.0.0.0:27017/todolistDB", {useNewUrlParser: true});

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema); 

//add 3 items into itemlist
const item1 = new Item({
  name: "Welcome to your todolist!"
});
const item2 = new Item({
  name: "Hit the + button to add a new item."
});
const item3 = new Item({
  name: "<-- Hit this to delete an item."
});
const defaultItems = [item1, item2, item3];



app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems){
    if(err) throw err;

    //if there are no items in the database (foundItems = []), add the default items, else don't add
    if(foundItems.length === 0){
      Item.insertMany(defaultItems, function(err){
        if(err) throw err;
        console.log("Successfully saved default items to DB.");
      })
      res.redirect("/"); //redirect to the homepage to force the GET request to render the list
    } 
    else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  });
}); 


app.post("/", function(req, res){
  const itemName = req.body.newItem;

  const item = new Item({
    name: itemName
  });

  item.save(function(err){
    if(err) throw err;
    console.log("Item saved successfully. Item is  " + req.body.newItem); })
  res.redirect("/"); //re-render the list
});

app.post('/delete', function(req, res){
  console.log(req.body.checkbox);
  const checkedItemId = req.body.checkbox;
  Item.findByIdAndRemove(checkedItemId, function(err){
    if(err) throw err;
    console.log("Item deleted." + checkedItemId);
    res.redirect('/');
  });

})
  



app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
