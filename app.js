//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-rohan:rohan2001@cluster0-1jmdi.mongodb.net/todolistDB?retryWrites=true&w=majority", {useNewUrlParser: true});
// mongoose.connect("mongodb://localhost:27017/userDB", {
//   userNewUrlParser: true
// });
const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);


const item1 = new Item({
  name: "Add your task here"
});
item1.save();

// const item2 = new Item({
//   name: "Hit the + button to add a new item."
// });
//
// const item3 = new Item({
//   name: "<-- Hit this to delete an item."
// });

const defaultItems = [item1];

const listsSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listsSchema);
//
const list1 = new List({
  name: "Personal",
  items: defaultItems
});

list1.save();

const defaultList = [list1];

let flag = 0;

const usersSchema = {
  email: String,
  password: String,
  lists: [listsSchema]
};

const User = mongoose.model("User", usersSchema);

var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
 var today=new Date();
 var type =today.getDate()+", "+days[today.getDay()];


app.get("/", function(req, res) {
  res.render("home");
});

app.get("/login", function(req, res) {
  res.render("login");
});

app.get("/register", function(req, res) {
  res.render("register");
});

app.post("/register", function(req, res) {
  const newUser = new User({
    email: req.body.username,
    password: req.body.password,
    lists: defaultList
  });
  User.findOne({
    email: newUser.email},function(err,foundUser){
      if(foundUser){
        res.render("login");
      }else{
        newUser.save(function(err) {
          if (err) {
            console.log(err);
          } else {
            res.render("login");
          }
        });
      }
    });

});
if (flag == 0) {
  var currentUser = "2@g.com";
}
 var currentlist = "Personal"
app.post("/login", function(req, res) {
  const username = req.body.username;
  const password = req.body.password;
  User.findOne({
    email: username
  }, function(err, foundUser) {

    if (err) {
      console.log(err);
    } else {
      if (foundUser) {

        flag == 1;
        currentUser = foundUser.email;
        if (foundUser.password === password) {
          res.redirect("/work");
        }else{
          res.render("nologin");
        }
      }
    }
  });
});



app.get("/list", function(req, res) {
  User.findOne({
    email: currentUser
  }, function(err, foundUser) {

    if (err) {
      console.log(err);
    } else {
      if (foundUser) {

        List.findOne({
          name: currentlist
        },function(err,foundList){
          if(err){
            console.log(err);
          }else{

            res.render("list", {
              listTitle: currentlist,
              newListItems: foundList.items,
              WorkTitle: type,
              newWorkItems: foundUser.lists,
            });


          }
        });
      }
    }
  });
});

// app.get("/customlist", function(req, res) {
//   const customListName = req.body.submit_param;
//   User.findOne({
//     email: currentUser
//   }, function(err, foundUser) {
//
//     if (err) {
//       console.log(err);
//     } else {
//       if (foundUser) {
//
//         List.findOne({
//           name: customListName
//         },function(err,foundList){
//           if(err){
//             console.log(err);
//           }else{
//             console.log(customListName);
//             // res.render("list", {
//             //   listTitle: customListName,
//             //   newListItems: foundList.items,
//             //   WorkTitle: "Types",
//             //   newWorkItems: foundUser.lists,
//             // });
//
//
//           }
//         });
//       }
//     }
//   });
// });

//
app.get("/work/:customListName", function(req, res){
  const customListName = req.params.customListName;
  User.findOne({
    email: currentUser
  }, function(err, foundUser) {

    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        foundUser.lists.forEach(function(list){
          if(list.name===customListName){
            res.render("list", {
              listTitle: customListName,
              newListItems: list.items,
              WorkTitle: type,
              newWorkItems: foundUser.lists,
            });
          }
        });

      }
    }
  });
});


  // User.findOne({
  //   email: currentUser
  // }, function(err, foundUser) {
  //
  //   if (err) {
  //     console.log(err);
  //   } else {
  //     if (foundUser) {
  //
  //       List.findOne({
  //         name: customListName
  //       },function(err,foundList){
  //         if(err){
  //           console.log(err);
  //         }else{
  //
  //           res.render("list", {
  //             listTitle: customListName,
  //             newListItems: foundList.items,
  //             WorkTitle: "Types",
  //             newWorkItems: foundUser.lists,
  //           });
  //
  //
  //         }
  //       });
  //     }
  //   }
  // });

  // List.findOne({name: customListName}, function(err, foundList){
  //   if (!err){
  //     if (!foundList){
  //       //Create a new list
  //       const list = new List({
  //         name: customListName,
  //         items: defaultItems
  //       });
  //       list.save();
  //       res.redirect("/" + customListName);
  //     } else {
  //       //Show an existing list
  //
  //       res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
  //     }
  //   }
  // });



//
app.post("/list", function(req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });




    item.save();

    User.findOne({
      email: currentUser
    }, function(err, foundUser) {

      if (err) {
        console.log(err);
      } else {
        if (foundUser) {
          foundUser.lists.forEach(function(list){
            if(list.name===listName){
              currentlist=list.name;
              list.items.push(item);
              foundUser.save();
              res.redirect("/work");
            }
          });




        }
      }
    });

  // } else {
  //   List.findOne({name: listName}, function(err, foundList){
  //     foundList.items.push(item);
  //     foundList.save();
  //     res.redirect("/" + listName);
  //   });
  // }
});
//
app.get("/work", function(req, res) {
  User.findOne({
    email: currentUser
  }, function(err, foundUser) {

    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        foundUser.lists.forEach(function(list){
          if(list.name===currentlist){
            res.render("list", {
                  listTitle: currentlist,
                  newListItems: list.items,
                  WorkTitle: type,
                  newWorkItems: foundUser.lists,
              });
          }
        });

        // List.findOne({
        //   name: currentlist
        // },function(err,foundList){
        //   if(err){
        //     console.log(err);
        //   }else{
        //
        //     res.render("list", {
        //       listTitle: currentlist,
        //       newListItems: foundList.items,
        //       WorkTitle: type,
        //       newWorkItems: foundUser.lists,
        //     });
        //
        //
        //   }
        //
        // });

      }
    }
  });
});

app.post("/work", function(req, res) {

  const itemName = req.body.newItem2;
  const workName = req.body.work;

  const list = new List({
    name: itemName,
    items: defaultItems
  });




    list.save();

    User.findOne({
      email: currentUser
    }, function(err, foundUser) {

      if (err) {
        console.log(err);
      } else {
        if (foundUser) {
          currentlist=itemName;

          foundUser.lists.push(list);
          foundUser.save();
          res.redirect("/work");


        }
      }
    });
  // } else {
  //   List.findOne({name: listName}, function(err, foundList){
  //     foundList.items.push(item);
  //     foundList.save();
  //     res.redirect("/" + listName);
  //   });
  // }
});


// app.post("/link",function(req,res){
//   const linkh=req.body.checkbox1;
//   User.findOne({
//     email: currentUser
//   }, function(err, foundUser) {
//
//     if (err) {
//       console.log(err);
//     } else {
//       if (foundUser) {
//
//         res.render("list", {
//           listTitle: linkh,
//           newListItems: foundUser.lists,
//           WorkTitle:"Types",
//           newWorkItems: foundUser.lists,
//         });
//
//       }
//     }
//   });
//
// });



app.post("/deleteitems", function(req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
    User.findOne({
      email: currentUser
    }, function(err, foundUser) {

      if (err) {
        console.log(err);
      } else {
        if (foundUser) {
          foundUser.lists.forEach(function(list){
            if(list.name===listName){
              var article_id = list._id;
              list.items.pull({_id: checkedItemId});

              foundUser.save();
                res.redirect("/work/"+currentlist);
            }
          });

        }
    }
  });
});


app.post("/deletework", function(req, res) {
  const checkedItemId = req.body.checkbox;
  const workName = req.body.workName;
    User.findOne({
      email: currentUser
    }, function(err, foundUser) {

      if (err) {
        console.log(err);
      } else {
        if (foundUser) {
          var article_id = foundUser._id;
          User.findByIdAndUpdate(
            article_id, {
              $pull: {
                'lists': {
                  _id: checkedItemId
                }
              }
            },
            function(err, model) {
              if (err) {
                console.log(err);
              }else{
                foundUser.save();
                res.redirect("/work");
              }
            });
        }
    }
  });


});
//
// app.get("/about", function(req, res){
//   res.render("about");
// });
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}


app.listen(port, function() {
  console.log("Server started on port 3000");
});
