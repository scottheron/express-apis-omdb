var express = require("express");
var app = express();
var request = require("request");
var bodyParser = require('body-parser');
var db = require('../models');
var router = express.Router();

router.use(bodyParser.urlencoded({extended: false}));

/*

*/
router.get("/", function(req, res){
	//res.send(process.env.MY_SECRET_KEY);
	db.favorite.findAll({
    include: [db.comment, db.tag]
  })
      .then(function(fav){
		    res.render("favorites/index.ejs", {
			  fav: fav,
      });
		});
	}
);

router.get("/:id/comments", function(req, res){
	var favoriteId = req.params.id;
	db.favorite.find({
    	where: {id: favoriteId},
    	include: [db.comment, db.tag]
  	}).then(function(fav) {
      res.render('comment.ejs', {favorite: fav});
  	});
});

router.post('/:id/comments', function(req, res) {
  	db.comment.create({
    	body: req.body.content,
    	title: req.body.author,
    	favoriteId: req.params.id
  	}).then(function() {
    	res.redirect('/favorites/' + req.params.id + '/comments');
  	});
});

router.post("/", function(req, res){
	var title = req.body.title;
	var year = req.body.year;
	var imdbId = req.body.imdbID;
	db.favorite.create({
		title: title,
		year: year,
		imdbId: imdbId
	}).then(function(){
		res.redirect("/favorites");
	});
	
});

// router.get('/:id/tags', function(req,res) {
//     db.tag.findAll().then(function(tag) {
//         res.render('tags.ejs', {tag: tag})
//     })
// })

router.post('/:id/tags', function(req,res) {
    db.tag.findOrCreate({
        where: { 
            name: req.body.tag
        }
    })
    .spread(function(tag) {
        var favid = req.params.id;
        db.favorite.find({
          where:{
            id: favid
        }})
        .then(function(fav){
          if(fav){
            fav.addTag(tag);
            res.redirect('/favorites');
          } else {
            res.send("nope");
          }
        }
      );
    }
  );
});

module.exports = router;

