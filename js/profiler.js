var baseUrl = "http://apis.appacitive.com/v0.9/core/"

// the default options
var _options = {
	deploymentId: '1299448326127981',
	referenceId: '26e08ab2-6707-414c-bdf0-8249bf3c6040',
	sessionId: 'm3ZmAeYuxRMlRf3cl6IcdKQZQp5lP+MsCsWnNDTIi6nYQDgjChNItmm3ZXMIlMcPizRDWotuTy7CAJtuUHahFT0MnbdGcY7vI8CUc0Z0lwQ=',
	container: '#divProfiler'
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
		callback = callback || function(){}
		callback(dummyProfile, translate(dummyProfile))
		return;
		$.get(url, function(data) {
			if (data.Code != 'success')
				callback(dummyProfile, translate(dummyProfile))
			else callback(data, translate(data))
		})
	}

	var parseStepWithChildren = function(step, depth) {
		var result = parseStep(step)
		step.Children = step.Children || []
		step.Children.forEach(function(child) {
			result.children.push(parseStepWithChildren(child, depth + 1))
		})
		result.level = depth
		return result
	}

	var parseStep = function(step) {
		return {
			stepName: step.Name,
			startTime: step.Start,
			timeTakenForSelf: step.DurationWithOutChildren,
			timeTakenForChildren: step.Duration - step.DurationWithOutChildren,
			children: [],
			id: step.Id,
			parentId: step.ParentId
		}
	}

	var translate = function(data) {
		return parseStepWithChildren(data.Head, 0)
	}

	this.initialize = getData
})

$(function() {
	profiler.initialize(_options, function(raw, profile) {
		raw.RequestUrl = raw.RequestUrl.substr(0, raw.RequestUrl.indexOf('?'))
		$('#divDetails').html(Mustache.render($('#tmplDetails').html(), raw))
		console.dir(profile)
		cartographer.renderProfile(profile, raw)
	})
})
