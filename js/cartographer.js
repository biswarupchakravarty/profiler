var cartographer = new (function() {
	/* will draw charts yo */

	//creates a rectange and returns it
	var Rectangle = function(options) {
		return $(Mustache.render($('#tmplRectangle').html(), options).trim())
	}

	var addElementToContainer = function($element) {
		$element.appendTo($('#divProfiler'))
	}

	var count = 0, barHeight = 15, widthFactor = 0.25, maxWidth = 600

	var flattenStep = function(step, flattened) {
		step.count = count++
		flattened.push(step)
		step.children.forEach(function(child) {
			flattenStep(child, flattened)
		})

		return flattened;
	}

	var renderStep = function(step) {
		var options = {
			x: parseInt(step.startTime * widthFactor),
			primaryWidth: (step.timeTakenForSelf * widthFactor) < 3 ? 3 :  (step.timeTakenForSelf * widthFactor),
			secondaryWidth: step.timeTakenForChildren * widthFactor,
			totalWidth: (step.timeTakenForSelf + step.timeTakenForChildren) * widthFactor,
			y: step.level,
			top: step.count * barHeight + 1,
			barHeight: barHeight,
			text: step.stepName,
			maxWidth: maxWidth,
			id: step.id,
			parentId: step.parentId,
			barColor: step.barColor
		}
		var rectangle = Rectangle(options)
		rectangle.find('svg').data().data = step
		addElementToContainer(rectangle)

		// temp hack
		$('<div></div>').addClass('text-wrapper').append(renderStepLabel(step, step.textColor)).appendTo($('div#divLegend'))
		$('<div></div>').addClass('text-wrapper').append(renderStepDetails(step, step.textColor)).appendTo($('div#divStepDetails'))
	}

	var getColorGenerator = function(totalTime) {
		var fast = [163,163,163], slow = [58,58,58]
		var rDiff = fast[0] - slow[0], rBase = slow[0]
		var gDiff = fast[1] - slow[1], gBase = slow[1]
		var bDiff = fast[2] - slow[2], bBase = slow[2]
		
		return function(time) {
			var r = parseInt(rDiff * ( 1 - time / totalTime)) + rBase
			var g = parseInt(gDiff * ( 1 - time / totalTime)) + gBase
			var b = parseInt(bDiff * ( 1 - time / totalTime)) + bBase

			return 'rgb(' + [r,g,b].join(',') + ')'
		}
	}

	var renderStepLabel = function(step, color) {
		var model = {
			name: step.stepName,
			color: color,
			indent: [],
			duration: step.timeTakenForChildren + step.timeTakenForSelf,
			withoutChildren: step.timeTakenForSelf,
			startTime: step.startTime
		}
		for (var x=0;x<step.level;x=x+1) {
			model.indent.push(' ')
		}
		var element = $(Mustache.render($('#tmplStepLabel').html(), model))
		element.data().id = step.id
		element.data().parentid = step.parentId
		element.click(function() {
			var id = $(this).data().id
			$('table').each(function() {
				if ($(this).data().parentid == id)
					$(this).parent().fadeToggle()
			})
			$('div.border-on-hover').each(function() {
				if ($(this).data().parentid == id)
					$(this).fadeToggle()
			})
		})
		return element
	}

	var renderStepDetails = function(step, color) {
		var model = {
			name: step.stepName,
			color: color,
			indent: [],
			duration: step.timeTakenForChildren + step.timeTakenForSelf,
			withoutChildren: step.timeTakenForSelf,
			startTime: step.startTime
		}
		var element = $(Mustache.render($('#tmplStepDetails').html(), model))
		element.data().id = step.id
		element.data().parentid = step.parentId
		element.click(function() {
			var id = $(this).data().id
			$('table').each(function() {
				if ($(this).data().parentid == id)
					$(this).parent().fadeToggle()
			})
			$('div.border-on-hover').each(function() {
				if ($(this).data().parentid == id)
					$(this).fadeToggle()
			})
		})
		return element
	}

	var calculateTotalCPUTime = function(profileStep, cumulativeTotal) {
		cumulativeTotal += profileStep.DurationWithOutChildren
		profileStep.Children.forEach(function(child) {
			calculateTotalCPUTime(child, cumulativeTotal)
		})
		return cumulativeTotal
	}

	this.renderProfile = function(profileData, rawData) {
		widthFactor = maxWidth / rawData.Head.Duration
		profileData = flattenStep(profileData, [])
		profileData[0].stepName = 'API Call'
		var totalCPUTime = calculateTotalCPUTime(rawData.Head, 0)
		var getColor = getColorGenerator(totalCPUTime)
		
		profileData.forEach(function(profileStep) {
			profileStep.barColor = getColor(profileStep.timeTakenForSelf)
			profileStep.textColor = getColor(profileStep.timeTakenForSelf)
			renderStep(profileStep)
		})
		
		console.dir(profileData)

		var totalTime = rawData.Head.Duration
		var template = $('#tmplTooltip').html()
		var format = function(num) { return parseFloat(num).toFixed(2) }
		$('div.border-on-hover').each(function() {
			$(this).tooltip({
				title: function() {
					var data = $(this).find('svg').data().data
					var model = {
						stepName: data.stepName,
						relativeSelf: format(data.timeTakenForSelf * 100 / totalTime),
						relativeTotal: format(data.timeTakenForSelf + data.timeTakenForChildren * 100 / totalTime),
						absoluteSelf: format(data.timeTakenForSelf),
						absoluteTotal: format(data.timeTakenForSelf + data.timeTakenForChildren)
					}
					return Mustache.render(template, model)
				},
				placement: 'bottom'
			})
		})
		// $('#divProfiler').draggable({axis: 'x'})
		$('.main-content-area').niceScroll()
	}
	
})