const http = require('http');

const PORT = 8080; 
var getTitle = function(url) {
	return new Promise(function (resolve, reject){
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
				resolve( str[1]);
			
			});
		}).on('error', function(e) {
			resolve("NO RESPONSE");
		});
	});
} 

var addElement = function(uri, title) {
	return new Promise(function (resolve, reject){
		resolve( "<li>" + uri + "-" + title + "</li>");
	});
} 

var processRequest = function(request, callback) {
	return new Promise(function (resolve, reject){
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
					getTitle(address).then(function(title){
						addElement(address, title).then(function(elemnt){ 
							response_html += elemnt;
							if(i+1 >= urls.length) {
								response_html += "</ul></body></html>"
								resolve(response_html);
							}
						}).catch(function(err){
						
						});
					
					}).catch(function(err){}); function (err, title) {

					});
				}					
			}
		}
		else {
			reject("NOT FOUND");
		}
	});
}
function handleRequest(request, response) {
	processRequest(request).then( function(resp){
		response.writeHead(200, {'Content-Type': 'text/html'});
		response.write(resp, function (){
			response.end();
		});
	}).catch(function(err){
				response.writeHead(404);
			response.write("NOT Found");
			return;
	});
	
}

var server = http.createServer(handleRequest);

server.listen(PORT, function(){
    console.log("Server listening on: http://localhost:%s", PORT);
});

