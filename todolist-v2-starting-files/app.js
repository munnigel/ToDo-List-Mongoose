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

//schemas
const itemsSchema = {
  name: String
};
const Item = mongoose.model("Item", itemsSchema); 

const listSchema = {
  name: String,
  items: [itemsSchema]
};
const List = mongoose.model("List", listSchema);


//add 3 default items into itemlist
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
  //find all items in the database
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
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  //check to see if the listname that triggered the POST request is the default list or a custom list
  if (listName === "Today"){
    item.save();
    res.redirect("/"); //re-render the list
  } 
  else {
    //search for the list document in list database and add the item to that list
    List.findOne({name: listName}, function(err, foundList){
      if (err) throw err;
      //push the item to the foundList's items array, and save
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
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
  




//the string after : is any name you want to give to the route
//u can route to any page and the 3 default items are added to the list of that page
app.get('/:customListName', function(req, res){
  const customListName = req.params.customListName;

  //check whether the list the user is trying to access exists in the database
  List.findOne({name: customListName}, function(err, foundList){
    if(err) throw err;
    if(!foundList){
      //add a new list into the database where the name is the same as the route and the items are the default 3 items
      const list = new List({
        name: customListName,
        items: defaultItems
      })

      list.save();
      res.redirect('/' + customListName);
    } else {
      //show an existing list
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
    }
  });
})


app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
