
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var querystring = require('querystring');
var watson = require('watson-developer-cloud');

var conversation = watson.conversation({
username: '390ce196-75f9-48ca-ac50-6de5dfb5181c', // replace with username from service key
password: 'kBahYbkUQIAD',
path: { workspace_id: 'c0c6a366-4d45-4bf9-bb16-4ee0a31aa5bf' },
version: 'v1',
version_date: '2017-04-21'
});

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);

var toshow = '';

function processResponse(err, response) {
	  if (err) {
	    console.error('EROR:'+err); // something went wrong
	    return;
	  }

	  // If an intent was detected, log it out to the console.
	  if (response.intents.length > 0) {
	    console.log('Detected intent: #' + response.intents[0].intent);
	  }
	  
	  // Display the output from dialog, if any.
	  if (response.output.text.length != 0) {
//	      console.log(response.output.text[0]);
	      toshow = response.output.text;
	      console.log("************"+toshow);
	  }

	}

var context  =  null;

app.post('/mainflow', function(req, res, next) {
	console.log('$$$$$$$$$$$$$$$$$$ In mainflow:',req.body.input, req.body.leavemgmt);
	
	if (null == context) {
		context = req.body.context;

	}
	
	var url = req.headers.referer;
	var param = url.split("?");
	console.log("url:"+url+" type:"+typeof(url)+" length:"+param.length );
	
	var username = '';
	if(param.length == 2)
	{
		var params =  querystring.parse(param[1]);
		if(null != params.username)
		{
			username = params.username+',';
		}
		console.log("params:"+JSON.stringify(params, null, 4));	
	}
	
	
	
	var client_input = req.body.input;
	
	conversation.message({
		  input: { text: client_input },
		  context: context
		 }, function(err, response) {
		     if (err) {
		       console.error(err);
		     } else {
//		    	 console.log("DDDDDDD:"+context.conversation_id);
		       console.log(JSON.stringify(response, null, 2));
		       context = response.context;//多轮对话需要将res的context赋给请求context
		   	if( null == req.body.input)
			{
				res.json('Hello '+username+' I am Watson, How can I help you? (Get more about us in <a href=\'#\' onclick=\'window.open("http://www.ibm.com/watson"); return;\'> IBM Watson</a>")');
			}
		   	else
		   	{
		   		res.json(response.output.text[0]);
		   	}
		     }
		});
//  	res.json(toshow);
});




http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
