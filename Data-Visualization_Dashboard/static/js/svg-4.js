var margin_4 = 35;

var width_4 = document.querySelector('#svg-4').clientWidth - 2 * margin_4;
var height_4 = document.querySelector('#svg-4').clientHeight - 2 * margin_4;

var svg_4 = d3.select('#svg-4');

var chart_4 = svg_4.append('g')
			.attr('transform', `translate(${margin_4*1.2}, ${margin_4*0.8})`);

var svg_4_global_data = {
	'json_data': 'none',
	'data': 'none',
	'colors': {
		'High income': '#28a745',
		'Upper middle income': '#007bff',
		'Lower middle income': '#fd7e14',
		'Low income': '#dc3545',
		'Other': '#000000'
	}
}
svg_4_global_data['income_group'] = Object.keys(svg_4_global_data.colors).map((x) => x.toLowerCase().split(' ')[0])

svg_4.append('text')
		.attr('x', (width_4/2)+margin_4)
		.attr('y', margin_4/2)
		.attr('class', 'title')
		.attr('text-anchor', 'middle')
		.attr('font-size', '0.8rem')
		.text('World Income Group')


d3.json('world.geo.json').then(function(json_data) {
	svg_4_global_data['json_data'] = json_data
	d3.csv('income_group_with_labour_force.csv').then(function(data) {
		svg_4_global_data['data'] = data

		// Map csv data to json
		for(i=0; i<data.length; i++) {
			datapoint = data[i]
			country_code = datapoint['Country Code']
			income_group = datapoint['IncomeGroup']
			labour_male = datapoint['Mean Labour Force Male']
			labour_female = datapoint['Mean Labour Force Female']

			for(j=0; j<json_data.features.length; j++) {
				json_country_code = json_data.features[j].properties['iso_a3']
				if(json_country_code == country_code) {
					json_data.features[j].properties.value = income_group;
					json_data.features[j].properties.labour_male = labour_male;
					json_data.features[j].properties.labour_female = labour_female;
					break;
				}
			}
		}

		var path_4 = d3.geoPath()
			.projection(d3.geoMercator()
							.scale(width_4/6)
							.translate([width_4/2.1, height_4/1.3]));

		var world_map = chart_4.selectAll("path")
			.data(json_data.features)
			.enter()
			.append('path')
			.attr('d', path_4)
			.attr('class', function(d) {
				return `country ${d.properties.value != undefined ? d.properties.value.toLowerCase().split(' ')[0] : 'other'}`
			})
			.style('fill', function(d) {return svg_4_global_data['colors'][d.properties.value]})
			
		world_map
			.on('mouseover', function(d) {
				var mouse = d3.mouse(this)
				document.querySelector('#svg-4-tooltip').innerHTML = `Country: ${d.properties.name}<br>Country Code: ${d.properties.iso_a3}<br>Income Group: ${d.properties.value}`

				d3.select('#svg-4-tooltip')
					.style('display', 'block')
					.style('left', mouse[0] + 75 +  'px')
					.style('top', mouse[1] + 'px')
					.style('font-size', '0.7em')

				d3.select(this)
					.style('opacity', '0.6')
			})
			.on('mouseout', function(d) {
				d3.select('#svg-4-tooltip')
					.style('display', 'none')
				d3.select(this)
					.style('opacity', '1')
			})
			.on('click', function(d) {
				showPieChart(d);
			})
	})
})

function showPieChart(d) {
	$(document.querySelector('.overlay')).css('top', document.documentElement.scrollTop)
	$("body").css("overflow", "hidden");
	$(document.querySelector('.overlay')).addClass('overlay-visible')

	var margin_5 = 35;
	var width_5 = document.querySelector('#svg-5').clientWidth - 2 * margin_5;
	var height_5 = document.querySelector('#svg-5').clientHeight - 2 * margin_5;
	var radius = Math.min(width_5, height_5) / 2.5;

	var svg_5 = d3.select("#svg-5");
	var chart_5 = svg_5.append('g')
						.attr('transform', `translate(${width_5/1.75}, ${height_5/1.75})`);

	var pie = d3.pie();

	var arc = d3.arc()
					.innerRadius(0)
					.outerRadius(radius)

	var label = d3.arc()
					.outerRadius(radius)
					.innerRadius(radius / 2)

	var arcs = chart_5.selectAll("arc")
						.data(pie([d.properties.labour_male, d.properties.labour_female]))
						.enter()
						.append('g')
						.attr('class', 'arc')

	arcs.append('path')
		.attr('fill', function(d, i) {
			return i == 0 ? '#007bff' : '#fd7e14'
		})
		.attr("stroke", "white")
		.attr("stroke-width", '5')
		.attr("d", arc)

	arcs.append('text')
		.attr('transform', function(d) {
			return 'translate(' + label.centroid(d) + ')';
		})
		.attr('text-anchor', 'middle')
		.attr('fill', '#fff')
		.attr('font-size', '0.8rem')
		.attr('class', 'svg-5-pie-label')
		.text(function(d, i) {
			return d.value + '%'
		})

	svg_5.append('text')
		.attr('x', (width_5/2)+margin_5*1.2)
		.attr('y', margin_5/2+margin_5*0.8)
		.attr('class', 'title')
		.attr('text-anchor', 'middle')
		.attr('font-size', '1.2rem')
		.text(`Male and Female Labour Force in ${d.properties.name} (%)`)

	svg_5.append('circle')
		.attr('cx', width_5/2 - width_5/16)
		.attr('cy', height_5 * 1.05)
		.attr('r', 10)
		.style("fill", '#007bff')

	svg_5.append('circle')
		.attr('cx', width_5/2 + width_5/12)
		.attr('cy', height_5 *1.05)
		.attr('r', 10)
		.style("fill", '#fd7e14')

	svg_5.append("text")
		.attr("x", width_5/2 - width_5/16 + 20)
		.attr("y", height_5 * 1.055)
		.text("Male")
		.style("font-size", "1em")
		.attr("alignment-baseline","middle")

	svg_5.append("text")
		.attr("x", width_5/2 + width_5/12 + 20)
		.attr("y", height_5 * 1.055)
		.text("Female")
		.style("font-size", "1em")
		.attr("alignment-baseline","middle")
}

function hidePieChart() {
	svg_5 = document.querySelector('#svg-5')
	while(svg_5.hasChildNodes()) {
		svg_5.removeChild(svg_5.childNodes[0])
	}
	$(document.querySelector('.overlay')).removeClass('overlay-visible')
	$("body").css("overflow", "auto");
}

$('#close-btn').on('click', hidePieChart)

for(i=0; i<svg_4_global_data.income_group.length; i++) {
	group = svg_4_global_data.income_group[i]
	c = document.querySelector('#'+group);
	text = c.parentNode.innerText;
	color = svg_4_global_data.colors[text]
	c.parentNode.style.borderColor = color

	$(c.parentNode).on('mouseover', function() {
		$(this).css('background-color', svg_4_global_data.colors[this.innerText]);
		$(this).css('color', '#ffffff');

		for(i=0;i<svg_4_global_data.income_group.length;i++) {
			group = svg_4_global_data.income_group[i]
			if(group == this.innerText.toLowerCase().split(' ')[0]) {
				d3.selectAll('.'+group)
					.style('opacity', 1)
			}
			else {
				d3.selectAll('.'+group)
					.style('opacity', 0.2)
			}
		}

	})
	$(c.parentNode).on('mouseout', function() {
		$(this).css('background-color', 'transparent');
		$(this).css('color', '#000000');
		d3.selectAll('.country')
			.style('opacity', 1)
	})
}