
/**
 * Module dependencies.
 */

var express = require('express')
, jsdom = require('cheerio')
, request = require('request')
, url = require('url')
, app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(require('stylus').middleware({ src: __dirname + '/public' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

app.get('/', function(req, res){
  res.render('index', {
    title: 'Express'
  });
});

app.get('/nodetube', function(req, res){
	//Tell the request that we want to fetch youtube.com, send the results to a callback function
        request({uri: 'http://youtube.com'}, function(err, response, body){
                var self = this;
		self.items = new Array();//I feel like I want to save my results in an array
		
		//Just a basic error check
                if(err && response.statusCode !== 200){console.log('Request error.');}


		//Use jQuery just as in any regular HTML page
                      var $ = cheerio.load(body)
                      , $body = $('body')
                      , $videos = $body.find('.video-entry');
		//I know .video-entry elements contain the regular sized thumbnails

		//for each one of those elements found
                      $videos.each(function(i, item){
			//I will use regular jQuery selectors
			var $a = $(item).children('a'),
			$title = $(item).find('.video-title .video-long-title').text(),
			$time = $a.find('.video-time').text(),
			$img = $a.find('span.clip img');
			//and add all that data to my items array
                              self.items[i] = { 
				href: $a.attr('href'),
				title: $title.trim(),
				time: $time,
				thumbnail: $img.attr('data-thumb') ? $img.attr('data-thumb') : $img.attr('src'),
				urlObj: url.parse($a.attr('href'), true)//parse our URL and the query string as well
			};
                      });
                      console.log(self.items);
		//We have all we came for, now let's build our views
		res.render('list', {
                      	title: 'NodeTube',
			items: self.items
                      });
              });
});

//Pass the video id to the video view
app.get('/watch/:id', function(req, res){
	res.render('video', {
		title: 'Watch',
        	vid: req.params.id
       	});
});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
