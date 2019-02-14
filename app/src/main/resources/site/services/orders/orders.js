var norseUtils = require('norseUtils');
var userLib = require('userLib');
var portal = require('/lib/xp/portal');
var contextLib = require('/lib/contextLib');
var contentLib = require('/lib/xp/content');
var helpers = require('helpers');
var thymeleaf = require('/lib/xp/thymeleaf');
var nodeLib = require('/lib/xp/node');

exports.get = function( req ) {
	var params = req.params;
    var view = resolve('orders.html');
    var model = {
        pageComponents: helpers.getPageComponents(req),
        orders: getOrders()
    };
    return {
        body: thymeleaf.render(view, model),
        contentType: 'text/html'
    };

    function getOrders(){
        var ordersRepo = nodeLib.connect({
            repoId: "orders",
            branch: "master"
        });
        var result = ordersRepo.query({
            start: 0,
            count: 999999999,
            query: ""
        });
        result = getOrdersObjects(result.hits);

        function getOrdersObjects( orders ){
            var result = [];
            for( var i = 0; i < orders.length; i++ ){
                result.push(ordersRepo.get(orders[i].id));
            }
            return result;
        }
        return result;
    }
};