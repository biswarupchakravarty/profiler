var baseUrl = "http://apis.appacitive.com/v0.9/core/"

// the default options
var _options = {
	deploymentId: 'restaurantsearch',
	referenceId: '696aed6f-a79b-4d51-85e0-1215555e05c8',
	sessionId: 'zBlLi5BvtHcubOjrEzii+ECUd6n7pn/tnDQ22r8YMxtTyGUsCJDMSClD1O5yEQ7gz9F6detguD5LddUVS+BCUnY3EVw5nOgl6s2iN4WjhjM='
}

var profiler = new (function() {
	
	// generates the url for the profile output
	var getUrl = function(options) {
		if (!options) {
			alert('deploymentId/referenceId/sessionId missing!')
		}
		var url = baseUrl + 'Profile.svc/' + options.deploymentId
		url += '/' + options.referenceId
		url += '?session=' + options.sessionId

		return url
	}

	var getData = function(options, callback) {
		var url = getUrl(options)
		$.get(url, function(data){
			document.write('<pre>'+JSON.stringify(data, null, 2) + '</pre>')
		})
	}

	this.initialize = getData
})

$(function() {
	profiler.initialize(_options)
})
