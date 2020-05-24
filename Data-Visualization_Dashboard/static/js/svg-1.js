var margin_1 = 35;

var width_1 = document.querySelector('#svg-1').clientWidth - 2 * margin_1;
var height_1 = document.querySelector('#svg-1').clientHeight - 2 * margin_1;

var svg_1 = d3.select('#svg-1');
var chart_1 = svg_1.append('g')
			.attr('transform', `translate(${margin_1*1.2}, ${margin_1*0.8})`);

var svg_1_global_data = {
	'sector': 'none',
	'data': 'none',
	'colors': {'male': '#007bff', 'female': '#fd7e14'},
	'genders': ['Male', 'Female'],
	'xScale': 'none',
	'yScale': 'none',
	'select_columns': 'none',
}

function select_columns() {
	res = [];
	columns = svg_1_global_data['data'].columns;
	for(i=1; i<columns.length; i++) {
		sector = columns[i].split(' ')[columns[i].split(' ').length-1].toLowerCase()
		if(sector == svg_1_global_data['sector']) {
			res.push(columns[i])
		}
	}
	return res
}

function drawlines(){
	// Update global data
	svg_1_global_data['sector'] = document.querySelector('#svg-1-selection > .active > input').id

	// Remove previous path and circle
	d3.selectAll('.line').remove()
	d3.selectAll('.dot').remove()

	// Get plotting columns
	var cols = select_columns();
	svg_1_global_data['select_columns'] = cols

	// Draw
	cols.forEach(function(col, index) {
		gender = col.split(' ')[1];
		sector = svg_1_global_data['sector'];
		data = svg_1_global_data['data'];
		colors = svg_1_global_data['colors'];
		xScale = svg_1_global_data['xScale'];
		yScale = svg_1_global_data['yScale'];

		line = d3.line()
				.x(function(d) {return xScale(d.Year)})
				.y(function(d) {return yScale(d[col])});

		path = chart_1.append('path')
					.attr('d', line(data))
					.attr('stroke', colors[gender.toLowerCase()])
					.attr('stroke-width', 1.5)
					.attr('fill', 'none');

		total_len = path.node().getTotalLength();

		circle = chart_1.selectAll(`dot-${gender}`)
					.data(data)
					.enter()
					.append('circle')
					.attr('class', `dot ${sector.toLowerCase()} ${gender.toLowerCase()}`)
					.attr('style', function(d, idx) {return `animation-delay: ${0.06*idx}s`})
					.attr('fill', colors[gender.toLowerCase()])
					.attr('r', 2.5)
					.attr('cx', function(d) {return xScale(d.Year)})
					.attr('cy', function(d) {return  yScale(d[col])})

		path.attr("stroke-dasharray", total_len + " " + total_len)
			.attr("stroke-dashoffset", total_len)
			.attr('class', `line ${sector.toLowerCase()} ${gender.toLowerCase()}`)
			.transition()
				.duration(2000)
				.ease(d3.easeLinear)
				.attr("stroke-dashoffset", 0)

		dots = document.getElementsByClassName('dot');
		for(i=0; i<dots.length; i++) {
			$(dots[i]).addClass('show')
		}
	});

	// Tooltip
	mouseG = svg_1.append("g")
            	.attr("class", "mouse-over-effects");

    mouseG.append("path") // create vertical line to follow mouse
            .attr("class", "mouse-line")
            .style("stroke", "#A9A9A9")
            .style("stroke-width", '2px')
            .style("opacity", "0");

    var mousePerLine = mouseG.selectAll('.mouse-per-line')
            .data(svg_1_global_data['data'])
            .enter()
            .append("g")
            .attr("class", "mouse-per-line");

    mouseG.append('svg:rect') // append a rect to catch mouse movements on canvas
            .attr('width', width_1) 
            .attr('height', height_1)
            .attr('fill', 'none')
            .attr('transform', `translate(${margin_1*1.2}, ${margin_1*0.8})`)
            .attr('pointer-events', 'all')
            .on('mouseout', function () { // on mouse out hide line, circles and text
				d3.select(".mouse-line")
					.style("opacity", "0");
				d3.selectAll(".mouse-per-line text")
					.style("opacity", "0");
				d3.selectAll("#svg-1-tooltip")
					.style('display', 'none')
            })
            .on('mouseover', function () { // on mouse in show line, circles and text
				d3.select(".mouse-line")
					.style("opacity", "1");
				d3.selectAll("#svg-1-tooltip")
					.style('display', 'block')
            })
            .on('mousemove', function () { // update tooltip content, line, circles and text when mouse moves
				var mouse = d3.mouse(this);

				d3.selectAll(".mouse-per-line")
					.attr("transform", function (d, i) {
						var xScale = svg_1_global_data['xScale']
						var xDate = xScale.invert(mouse[0]) // use 'invert' to get date corresponding to distance from mouse position relative to svg
						var bisect = d3.bisector(function (d) { return d.Year; }).right // retrieve row index of date on parsed csv
						var idx = bisect(svg_1_global_data['data'], xDate);

						d3.select(".mouse-line")
							.attr('transform', `translate(${margin_1*1.2}, ${margin_1*0.8})`)
		                    .attr("d", function () {
								var data = "M" + xScale(svg_1_global_data.data[idx].Year) + "," + (height_1);
								data += " " + xScale(svg_1_global_data.data[idx].Year) + "," + 0;
								return data;
		                    });

	                   	d3.select('#svg-1-tooltip')
	                   		.style('display', 'block')
	                   		.style('left', mouse[0] + 75 + 'px')
          					.style('top', mouse[1] + 'px')
          					.style('font-size', '0.7em')

          				document.querySelector('#svg-1-tooltip').innerHTML = `Year: ${svg_1_global_data.data[idx].Year}<br>Male: ${parseFloat(svg_1_global_data.data[idx][svg_1_global_data['select_columns'][1]]).toPrecision(4)}<br>Female: ${parseFloat(svg_1_global_data.data[idx][svg_1_global_data['select_columns'][0]]).toPrecision(4)}`
		                translateX = xScale(svg_1_global_data.data[idx].Year);
		                translateY = yScale(svg_1_global_data.data[idx][svg_1_global_data['select_columns'][0]])
						return "translate(" + translateX + "," + translateY + ")";
                });
			});

}

d3.csv('employment_by_year.csv').then(function(data) {
	svg_1_global_data['data'] = data

	// Axis
	var dataXrange = [d3.min(data, function(d) {return d.Year}), `${parseInt(d3.max(data, function(d) {return d.Year}))+1}`]
	var dataYrange = [0, 60];

	var xScale = d3.scaleTime()
					.range([0, width_1])
					.domain(dataXrange);

	var yScale = d3.scaleLinear()
					.range([height_1, 0])
					.domain(dataYrange);

	svg_1_global_data['xScale'] = xScale;
	svg_1_global_data['yScale'] = yScale;	

	chart_1.append('g')
		.attr('class', 'yAxis')
		.style('font-size', '0.6rem')
		.call(d3.axisLeft(yScale)
				.tickSize(-width_1))
		
		.call(g => {
			g.selectAll(".yAxis > .tick > line")
				.attr('stroke', '#A9A9A9')
				.attr('stroke-width', 0.7) // make horizontal tick thinner and lighter so that line paths can stand out
				.attr('opacity', 0.3)

			g.select(".domain").remove()
		});

	chart_1.append('g')
		.attr('class', 'xAxis')
		.style('font-size', '0.6rem')
		.attr('transform', `translate(0, ${height_1})`)
		.call(d3.axisBottom(xScale)
				.tickFormat(d3.format("d")))

	// Lines
	drawlines();

	// Title and Labels
	svg_1.append('text')
		.attr('x', -(height_1/2)-margin_1)
		.attr('y', margin_1/2)
		.attr('class', 'yLabel')
		.attr('transform', 'rotate(-90)')
		.attr('text-anchor', 'middle')
		.attr('font-size', '0.7rem')
		.text('Mean Employment Rate')

	svg_1.append('text')
		.attr('x', (width_1/2)+margin_1)
		.attr('y', height_1+margin_1*1.7)
		.attr('class', 'xLabel')
		.attr('text-anchor', 'middle')
		.attr('font-size', '0.7rem')
		.text('Year')

	svg_1.append('text')
		.attr('x', (width_1/2)+margin_1)
		.attr('y', margin_1/2)
		.attr('class', 'title')
		.attr('id', 'title-svg-1')
		.attr('text-anchor', 'middle')
		.attr('font-size', '0.8rem')
		.text('Employment Rate from 1991 to 2018 in Agriculture')

	svg_1.append('circle')
		.attr('cx', width_1 * 0.99)
		.attr('cy', height_1 * 0.96)
		.attr('r', 3)
		.style("fill", '#007bff')

	svg_1.append('circle')
		.attr('cx', width_1 * 0.99)
		.attr('cy', height_1 *1.01)
		.attr('r', 3)
		.style("fill", '#fd7e14')

	svg_1.append("text")
		.attr("x", width_1 * 1.01)
		.attr("y", height_1 * 0.96)
		.text("Male")
		.style("font-size", "0.6em")
		.attr("alignment-baseline","middle")

	svg_1.append("text")
		.attr("x", width_1 * 1.01)
		.attr("y", height_1 * 1.015)
		.text("Female")
		.style("font-size", "0.6em")
		.attr("alignment-baseline","middle")
})

// Chenge selection
$('#svg-1-selection').find('input').on('click', function() {
	ori_title = document.querySelector('#title-svg-1').innerHTML.split(' ')
	ori_title.pop()
	ori_title.push(this.parentNode.innerText)
	document.querySelector('#title-svg-1').innerHTML = ori_title.join(' ')
	$(this.parentNode).addClass('active');
	drawlines();
});
