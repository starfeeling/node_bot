var request = require('request');
var cheerio = require('cheerio');
var async = require('async');
var db = require('mysql');
var util = require('./utils.js');
var config = require('./configLoader.js');
 
config.load(__dirname+'/config.json');
 
var Crawler = function(){
  var self = this;
    this.conn = db.createConnection(config.get('db'));
    this.indexed = 0;
    this.baseSite = config.get('baseSite');
    this._url = this.baseSite;
    this.url = this.baseSite;
    
    this.crawl = function(cb){
        this.conn.query('SELECT * FROM `queue` LIMIT 0,1',function(e,result){
            self.url = result.length > 0 ? result[0].url : self.baseSite;
            request(self.url,function(e,res,body){
                if(!e && res.statusCode === 200){
                    self.getInfo(body);
                }
                else {
                    function S4() {
                       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
                    }
         
                    function NewGuid() {
                       return (S4()+S4()+S4());
                    }
        
                    var key = NewGuid();
                    console.log('Error requesting page %s',self.url + key);
                }
                
                if(result.length > 0){
                    self.conn.query('DELETE FROM `queue` WHERE `id` = ?',[result[0].id],function(){
                        cb();
                    });
                }
                else {
                    cb();
                }
                self._url = self.url;
            });
        });
    };
    
    this.getInfo = function(html){
            function S4() {
               return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
            }
 
            function NewGuid() {
               return (S4()+S4()+S4());
            }

            var key = NewGuid();
        
        var $ = cheerio.load(html);
        var title = $('head title').text();
        var keywords = $('head meta[name=keywords]').attr('content');
        var desc = $('head meta[name=description]').attr('content');
        var links = $('ul > li > a');
        console.log(links);

    };
};
 
module.exports = Crawler;