const product = async (link, type) => {
    if (type == 'compact') { var compact = true, minimumResult = false; } else if (type == 'minimum') { var compact = false, minimumResult = true; } else { var compact = false, minimumResult = false; }
    try {
        const uri = encodeURI(link)
        console.log("Product details initiated")
        try {
            var webPage = await (await fetch('https://www.flipkart.com/' + uri)).text();
            webPage = webPage.replace(/&amp;/g, '&')
            // for has been moved or deleted
            if (doesExist(webPage.split('for has been moved or deleted'))) {
                throw "Link provided doesn't corresponds to any product";
            }
        } catch (e) {
            return JSON.stringify({
                "error_message": e,
                "possible_solution": "Validate your link and try removing https://www.flipkart.com from your product link",
                "bug_report": "https://github.com/dvishal485/flipkart-scraper-api/issues"
            })
        }
        var rating = null, price = null, properURI = null, title = null, oprice, highlights = [];
        if (webPage.split('<h1').length > 1) {
            var title = webPage.split('<h1')[1].split('</span>')[0].split('">')[2].replace(/<!-- -->/g, '').replace(/&nbsp;/g, '');
        } else {
            var title = webPage.split('class="B_NuCI"')[1].split('</span>')[0].split('>')[1].replace(/<!-- -->/g, '').replace(/&nbsp;/g, '')
        }
        try {
            var price = webPage.split('<h1')[1].split(">₹")[1].split("</div>")[0]
        } catch (e) {
            var price = null
        }
        try {
            var discountCheck = webPage.split('<h1')[1].split(">₹")[2].split("</div>")[0].split('<!-- -->')
            var discounted = doesExist(discountCheck)
        } catch (e) {
            var discounted = false
        }
        try {
            var t = webPage.split('height:64px')
            var thumbnails = []
            for (var i = 1; i < t.length; i++) {
                try {
                    var thumb = t[i].split('</div>')[0].split('background-image:url(')[1].split(')')[0]
                    thumbnails.push(thumb)
                } catch (e) { }
            }
        } catch (e) {
            var thumbnails = null
        }
        try {
            var fAssCheck = webPage.split('<h1')[1].split('>₹' + price)[0].split('fk-cp-zion/img/fa_62673a.png')
            var fassured = doesExist(fAssCheck)
        } catch (e) {
            var fassured = doesExist(webPage.split('fk-cp-zion/img/fa_62673a.png'))
        }
        try {
            price = parseInt(price.replace(/,/g, ''))
            if (discounted) {
                oprice = parseInt(discountCheck[1].replace(/,/g, ''))
            } else { oprice = price }
        } catch (e) {
            oprice = null
        }
        try {
            var properURIlocate = webPage.split('product.share.pp')[0].split('"url":"')
            var properURI = lastEntry(lastEntry((lastEntry(properURIlocate) + 'product.share.pp').split(' ')).split('"'))
            if (properURI[0] == '/') { properURI = 'http://www.flipkart.com' + properURI }
            if (String(properURI).toLowerCase().split('login').length > 1) { properURI = `http://www.flipkart.com/${uri}` }
        } catch (e) {
            var properURI = `http://www.flipkart.com/${uri}`
        }
        var url = new URL(properURI);
        url.searchParams.delete('_appId')
        url.searchParams.delete('_refId')
        url.searchParams.delete('cmpid')
        properURI = url.toString()
        var stock = doesExist(webPage.split('This item is currently out of stock</div>')) || doesExist(webPage.split('Coming Soon</div>'))
        var highlightsLocator = webPage.split('Highlights')[1].split('</ul>')[0].replace(/<\/li>/g, '').split('<li')
        if (doesExist(highlightsLocator)) {
            var i;
            for (i = 1; i < highlightsLocator.length; i++) {
                highlights.push(highlightsLocator[i].split('>')[1])
            }
        }
        var isRated = fAssCheck[0].split('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMyIgaGVpZ2h0PSIxMiI+PHBhdGggZmlsbD0iI0ZGRiIgZD0iTTYuNSA5LjQzOWwtMy42NzQgMi4yMy45NC00LjI2LTMuMjEtMi44ODMgNC4yNTQtLjQwNEw2LjUuMTEybDEuNjkgNC4wMSA0LjI1NC40MDQtMy4yMSAyLjg4Mi45NCA0LjI2eiIvPjwvc3ZnPg==')
        if (doesExist(isRated)) {
            var rateDetector = isRated[0].split('">')
            var rating = lastEntry(rateDetector).split('<')[0]
        } else {
            try {
                var rating = webPage.split(`_3LWZlK`)[1].split(`<`)[0].split(`>`)[1].trim()
            } catch (e) { }
        }
        if (price == null || price == undefined || price == NaN || price < 1) {
            price = parseInt(webPage.split(`_30jeq3 _16Jk6d`)[1].split(`</div>`)[0].split(`>`)[1].replace(/₹/g, '').replace(/,/g, ''))
        }
        if (oprice == null || oprice == undefined || oprice == NaN || oprice < 1) {
            oprice = parseInt(webPage.split(`_3I9_wc _2p6lqe`)[1].split(`</div>`)[0].split(`>`)[1].replace(/₹/g, '').replace(/,/g, ''))
        }
        if (!minimumResult) {
            var specs = []
            var specsLocator = webPage.split('Specifications</div>')[1].split('>Safe and Secure Payments.')[0].replace(/&amp;/g, '&').split('</div><table')
            var i;
            for (i = 1; i < specsLocator.length; i++) {
                var compactDetails = '';
                var tableData = [];
                var headingLocator = specsLocator[i - 1].split('>')
                var heading = lastEntry(headingLocator)
                var tableTD = specsLocator[i].split('</td>')
                var k;
                for (k = 1; k < tableTD.length; k = k + 2) {
                    var td = tableTD[k - 1].split('>')
                    var tdData = lastEntry(td)
                    var tr = tableTD[k].split('</li>')[0].split('>')
                    var trData = lastEntry(tr)
                    if (tdData != null && tdData != "" && trData.split("<").length == 1 && trData != "") {
                        if (!compact) {
                            tableData.push({
                                "property": tdData,
                                "value": trData
                            })
                        } else {
                            compactDetails += tdData + ' : ' + trData + '; '
                        }
                    }
                }
                if (tableData != []) {
                    if (!compact) {
                        specs.push({
                            "title": heading,
                            "details": tableData
                        })
                    } else {
                        specs.push({
                            "title": heading,
                            "details": compactDetails
                        })
                    }
                }
            }
            return JSON.stringify({
                "name": title.replace(/&#x27;/g, `'`),
                "current_price": price,
                "original_price": oprice,
                "discounted": discounted,
                "discount_percent": parseInt(100 * (1 - price / oprice)),
                "rating": rating,
                "in_stock": !stock,
                "f_assured": fassured,
                "share_url": properURI,
                "thumbnails": thumbnails,
                "highlights": highlights,
                "specs": specs
            }, null, 2)
        } else {
            return JSON.stringify({
                "name": title.replace(/&#x27;/g, `'`),
                "current_price": price,
                "original_price": oprice,
                "discounted": discounted,
                "discount_percent": parseInt(100 * (1 - price / oprice)),
                "rating": rating,
                "in_stock": !stock,
                "f_assured": fassured,
                "share_url": properURI,
                "thumbnails": thumbnails,
                "highlights": highlights
            }, null, 2)
        }
    } catch (err) {
        return JSON.stringify({
            "error": "Couldn't fetch information : " + err.message,
            "possible_solution": "Don't lose hope, contact the support",
            "bug_report": "https://github.com/dvishal485/flipkart-scraper-api/issues"
        })
    }
}

function lastEntry(x) { return x[x.length - 1] }
function doesExist(x) { return x.length > 1 }

export default product
