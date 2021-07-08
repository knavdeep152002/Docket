const express = require('express');
const bodyParser = require('body-parser');
const day = require(__dirname+'/date.js');
const mongoose = require('mongoose');
const _ = require('lodash');

const app = express();
mongoose.connect("mongodb+srv://admin-karalius:test123@cluster0.c3y3s.mongodb.net/todolistDB",{useNewUrlParser: true,useUnifiedTopology: true});
const itemsSchema = mongoose.Schema({
    name: String
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Welcome"
});
const item2 = new Item({
    name: "Hit + to add"
});
const item3 = new Item({
    name: "hit checkbox to delete"
});

const itemslist = [item1,item2,item3];

const listSchema = mongoose.Schema({
    name: String,
    items: [itemsSchema]
});

const List = mongoose.model("List",listSchema);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.get("/", function (req, res) {
    Item.find({},function(err,items){
        // console.log(items);
        if(items.length === 0){
            Item.insertMany(itemslist,function(err){
                if(err){
                    console.log("error");
                }
            });
            res.redirect('/');
        }
        else{
            res.render('list', { list: items ,title: "Today"}); 
        }
    });
});


app.post('/', function(req, res){
    let todo = req.body.add;
    let title = req.body.button;
    console.log(title)
    const item = new Item({
        name: todo
    });
    if(title === "Today"){
        item.save();
        res.redirect('/');
    }
    else{
        List.findOne({name:title},function(err,found){
            if(!err && found){
                found.items.push(item);
                found.save();
            }
            res.redirect('/'+title);
        });
    }
});

app.post('/delete',function(req,res){
    let id = req.body.checkbox;
    let listname = req.body.listname;
    if(listname === "Today"){
        Item.findByIdAndRemove(id,function(err){
            if(err){
                console.log("NOO");
            }
        });
        res.redirect('/');
    }
    else{
        List.findOneAndUpdate(
            {name: listname},
            {$pull: {items: {_id:id}}},
            function(err,found){
                if(!err){
                    res.redirect("/"+listname);
                }
            }
        );
    }
});

app.get("/:route",function(req, res){
    const route = _.capitalize(req.params.route); 
    List.findOne({name:route},function(err,found){
        if(!err){
            if(!found){
                const list = new List({
                    name: route,
                    items: itemslist
                });
                list.save();
                res.redirect('/'+route);
            }
            // console.log(found);
            else{
                res.render('list', { list: found.items ,title: found.name});
            }
        }
    });
});



app.listen(process.env.PORT || 3000);