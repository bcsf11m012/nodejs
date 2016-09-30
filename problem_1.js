const http = require('http');

const PORT = 8080; 
var getTitle = function(url, callback) {
	var options = {
		host: url
	};
	var html = "" ;
	http.get(options, function(res) {
		res.on("data", function (chunk) {
			html += chunk;
		});
		res.on("end", function () {
			var str = html.match('<TITLE>' + "(.*)" + '</TITLE>');
			return callback(null, str[1]);
		
		});
	}).on('error', function(e) {
		return callback(null, "NO RESPONSE");
	});
} 

var addElement = function(uri, title, callback) {
	callback(null, "<li>" + uri + "-" + title + "</li>")
} 

var processRequest = function(request, callback) {
	if(request.url.includes('I/want/title')) {
		var query_string = request.url.match('I/want/title/(.*)');
		var response_html = "<html>" +
		"<head></head>" +
		"<body>" +
		"<h1> Following are the titles of given websites: </h1>" +
		"<ul>" ;
		if ( query_string[1].length > 0 && 
			 query_string[1] != undefined) {
			var urls = query_string[1].split('&');
			for( var i = 0 ; i < urls.length; i++) {
				var address = urls[i].split("=")[1];
				getTitle(address, function (err, title) {
					addElement(address, title, function(err, elemnt) {
						response_html += elemnt;
						if(i+1 >= urls.length) {
							response_html += "</ul></body></html>"
							callback(null, response_html);
						}
					});
				});
			}			
			
			return callback(null, response_html);
		}
	}
	else {
		return callback("NOT FOUND", null);
	}
}
function handleRequest(request, response) {
	processRequest(request, function(err,resp){
		if(err) {
			response.writeHead(404);
			response.write("NOT Found");
			return;
		}
		response.writeHead(200, {'Content-Type': 'text/html'});
		response.write(resp, function (){
			response.end();
		});
	});
	
}

var server = http.createServer(handleRequest);

server.listen(PORT, function(){
    console.log("Server listening on: http://localhost:%s", PORT);
});

