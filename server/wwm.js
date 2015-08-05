var connect = require('connect');
var serveStatic = require('serve-static');
connect().use(serveStatic("D:/Projects/JuztMove/walkwithme/dev/WalkWithMe/www")).listen(8080);