// Compile JSX using Windows JScript + Babel standalone
// Run: cscript compile_jsx.vbs

var fso = new ActiveXObject("Scripting.FileSystemObject");
var shell = new ActiveXObject("WScript.Shell");

WScript.Echo("Reading app.js...");
var f = fso.OpenTextFile("d:\\Team Projects\\js\\app.js", 1, false, -1);
var src = f.ReadAll();
f.Close();
WScript.Echo("app.js length: " + src.length);

// Load Babel via MSXML HTTP
WScript.Echo("Loading Babel...");
var http = new ActiveXObject("MSXML2.ServerXMLHTTP");
http.open("GET", "file:///d:/Team Projects/libs/babel.min.js", false);
http.send();
WScript.Echo("Babel loaded, size: " + http.responseText.length);
