const express= require ("express");
const bodyParser=require ("body-parser");
//const date=require(__dirname+"/date.js");
const mongoose=require("mongoose");
const app= express();
const _ =require("lodash")
// let items=[];
// let workItems=[];

app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine', 'ejs');
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB",{useNewUrlParser:true,useUnifiedTopology: true,  useFindAndModify: false } );

const itemsSchema={                          //CREATING ITEM SCHEMA
  name:String                                //
};                                           //

const Item= mongoose.model("Item",itemsSchema);    //CREATING ITEM SCHEMA MODEL

const item1= new Item({                          // CREATING MONGOOSE DOCUMENT
  name:"hey welcome"
});

const item2= new Item({
  name:"Simran"
});

const item3= new Item({
  name:"Check it"
});                                           //MONGOOSE DOCUMENT END

const defaultItems=[item1,item2,item3];        //A Default array for holding

const listSchema ={                                 //CREATING ITEM SCHEMA
  name:String,
  items:[itemsSchema]
};

const List=mongoose.model("List",listSchema);         //CREATING LIST SCHEMA MODEL

                                                       //app.get{ starts}
app.get("/",function(req,res){
Item.find({},function(err,foundItems){
  if(foundItems.length===0){
    Item.insertMany(defaultItems,function(err){
      if(err){
      console.log(err);
    }else{
      console.log("successsfully");}
    });
      res.redirect("/");
  }
  else{
  res.render("list",{listTitle:"Today",newListItems:foundItems});
   }
});
  });
                                                         //APP.GET END

 //app.get{ starts}
  app.get("/:customListName",function(req,res){
  const customListName=_.capitalize(req.params.customListName);

  List.findOne({name:customListName},function(err,foundList){
      if(!err){
      if(!foundList){
        const list=new List({
          name:customListName,
          items:defaultItems
        });
        list.save();
        res.redirect("/"+customListName);
        }
     else {
        res.render("list",{listTitle:foundList.name, newListItems:foundList.items}) ;
        }
      }
  });
});
   //APP.GET END

  //APP.POST start
app.post("/",function(req,res){
  const itemName=req.body.newItem;
  const listName=req.body.list
  const item=new Item({
  name:itemName
});

  if(listName==="Today"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });
  }

});

//APP.POST ENDS

  //APP.POST FOR DELETE
  app.post("/delete", function(req, res){

    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "Today") {
      Item.findByIdAndRemove(checkedItemId, function(err){
        if (!err) {
          console.log("Successfully deleted checked item.");
          res.redirect("/");
        }
      
      });
    } else {

      List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
        if (!err){
          res.redirect("/" + listName);
          console.log("no error.");
        }
      });
    }
  });
//APP.POST ENDS

app.get("/about", function(req, res){
  res.render("about");
});


app.listen(process.env.PORT||3000,function(req,res){
  console.log("app is running");
});
