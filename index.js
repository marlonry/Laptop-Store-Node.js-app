const fs = require('fs');
const http = require('http');
const url = require('url');

// fs.readFileSync acceses files in the system
const json = fs.readFileSync(`${__dirname}/data/data.json`, 'utf-8');
// parses json file into an object .stringify turns object into a string ready to sent to a server
const laptopData = JSON.parse(json); 

// creates server
const server = http.createServer((req, res) => {

    // url.parse(req.url, true) creates a object of the request displaying all the url information
    const pathName = url.parse(req.url, true).pathname; // pathname
    const id = url.parse(req.url, true).query.id // query after ? returns and usable object

    // simple routing

    // PRODUCTS OVERVIEW
    if(pathName === '/products' || pathName === '/') { // if path the route is... then
        res.writeHead(200, { 'Content-type': 'text/html' }); // sends html type content with code 200
        
        // readfile access the file asyncronously and passes that file to the data argument in utf-8 standards
        fs.readFile(`${__dirname}/templates/template-overview.html`, 'utf-8', (err, data) => {

            // its the html for the template overview stored in the overviewoutput
            let overviewOutput = data;

            // reads the card file and pasees to data
            fs.readFile(`${__dirname}/templates/template-card.html`, 'utf-8', (err, data) => {
                
                // maps the json object data and calls the function which replaces the content place holders with the data , return a string in the cardsOutput
                const cardsOutput = laptopData.map(el => replaceTemplate(data, el)).join('');
                
                /** replaces the html place holder in the overviewoutput with the new cardsoutput*/
                overviewOutput = overviewOutput.replace('{%CARDS%}', cardsOutput);
                
                /** returns the new overview output to the end = browser*/
                res.end(overviewOutput);
            });
        });
    } 
    
    // LAPTOP DETAIL
    else if(pathName === '/laptop' && id < laptopData.length) {
        res.writeHead(200, { 'Content-type': 'text/html' });
        
        // wait for node to read file then pass the data into the callback as data parameter
        fs.readFile(`${__dirname}/templates/template-laptop.html`, 'utf-8', (err, data) => {
            const laptop = laptopData[id];
            const output = replaceTemplate(data, laptop);
            res.end(output);
        });
    }

    // GENERAL ROUTE FOR IMAGES

    /** checks if the pathname contains and image extension
     * if it's got a image extension then returns the image
     * node.js doesnt know about the files structure it only gets requests that why we have to do this to send the image to the end
     * write the head and sends all the requested data back to the end in its container where it was requested
     */
    else if ((/\.(jpg|jpeg|png|gif)$/i).test(pathName)) {
        fs.readFile(`${__dirname}/data/img${pathName}`, (err, data) => {
            res.writeHead(200, { 'Content-type': 'image/jpg' });
            res.end(data);
        });
    }

    // URL NOT FOUND
    else {
        res.writeHead(404, { 'Content-type': 'text/html' });
        res.end('url was not found on the server');
    }
});

// starts listening for requests to the server
server.listen(1337, '127.0.0.1', () => {
    console.log('Listening for request now');
});


/**
 * takes two arguments html and the laptop object and replaces the placeholder regular expression in the html with the laptop data
 * @param {*html} originalHTML 
 * @param {*object} laptop 
 */
function replaceTemplate(originalHTML, laptop) {
    let output = originalHTML.replace(/{%PRODUCTNAME%}/g, laptop.productName);
    output = output.replace(/{%IMAGE%}/g, laptop.image);
    output = output.replace(/{%PRICE%}/g, laptop.price);
    output = output.replace(/{%SCREEN%}/g, laptop.screen);
    output = output.replace(/{%CPU%}/g, laptop.cpu);
    output = output.replace(/{%STORAGE%}/g, laptop.storage);
    output = output.replace(/{%RAM%}/g, laptop.ram);
    output = output.replace(/{%DESCRIPTION%}/g, laptop.description);
    output = output.replace(/{%ID%}/g, laptop.description);
    return output;
}
