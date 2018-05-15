const node_static = require('node-static');

const fileServer = new node_static.Server('./public');

require('http').createServer(function(request, response) {
  request.addListener('end', function() {
    fileServer.serve(request, response);
  }).resume();
}).listen(8080);
