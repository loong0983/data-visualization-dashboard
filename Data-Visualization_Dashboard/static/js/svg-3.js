var margin_3 = 35;

var width_3 = document.querySelector('#svg-3').clientWidth - 2 * margin_3;
var height_3 = document.querySelector('#svg-3').clientHeight - 2 * margin_3;

var svg_3 = d3.select('#svg-3');
var chart_3 = svg_3.append('g')
			.attr('transform', `translate(${margin_3*1.2}, ${margin_3*0.8})`);

var svg_3_global_data = {
	'data': 'none',
	'xScale': 'none',
	'yScale': 'none',
	'gender': 'male',
	'columns': 'none',
	'selected_cols': 'none',
	'colors': { 'East Asia & Pacific': '#dc3545',
				'Europe & Central Asia': '#fd7e14', 
				'Latin America & Caribbean': '#ffc107', 
				'Middle East & North Africa': '#28a745', 
				'North America': '#007bff', 
				'South Asia': '#6610f2', 
				'Sub-Saharan Africa': '#343a40'},
}
svg_3_global_data['regions'] = Object.keys(svg_3_global_data.colors).map((x) => x.toLowerCase().split(' ')[0])

function get_svg_3_columns() {
	res = [];
	columns = svg_3_global_data['columns'];
	for(i=0; i<columns.length; i++) {
		gender = columns[i].split(' ')[columns[i].split(' ').length-1].toLowerCase()
		if(gender == svg_3_global_data['gender']) {
			res.push(columns[i])
		}
	}
	return res
}

function draw_bubbles() {
	data = svg_3_global_data['data'];
	xScale = svg_3_global_data['xScale'];
	yScale = svg_3_global_data['yScale'];

	// Remove previous bubbles
	d3.selectAll('.bubbles').remove();

	// Get current selection
	svg_3_global_data['gender'] = document.querySelector('#svg-3-selection > .active > input').id

	var cols = get_svg_3_columns();
	svg_3_global_data['selected_cols'] = cols;

	circle = chart_3.selectAll('bubbles')
					.data(data)
					.enter()
					.append('circle')
					.style('opacity', 0.6)
					.attr('class', function(d) {return `bubbles ${svg_3_global_data.gender} ${d.Region.toLowerCase().split(' ')[0]}`})
					.attr('fill', function(d) {return svg_3_global_data.colors[d['Region']]})
					.attr('r', 7)
					.attr('cx', function(d) {return xScale(d[cols[0]])})
					.attr('cy', function(d) {return yScale(d[cols[1]])})
					.on('mouseover', bubble_mouseover)
					.on('mouseout', bubble_mouseout)
}

function bubble_mouseover(d, i) {
	var mouse = d3.mouse(this)
	region = d.Region.toLowerCase().split(' ')[0]

	for(i=0;i<svg_3_global_data.regions.length;i++) {
		r = svg_3_global_data.regions[i]
		if(r == region) {
			d3.selectAll('.'+region)
				.style('opacity', 1)
		}
		else {
			d3.selectAll('.'+r)
				.style('opacity', 0.2)
		}
	}

	document.querySelector('#svg-3-tooltip').innerHTML = `Country: ${d['Country Name']}<br>Gender: ${svg_3_global_data.gender}<br>Region: ${d.Region}<br>Mean Salaries: ${parseFloat(d[svg_3_global_data.selected_cols[0]]).toPrecision(4)}<br>Unemployment Rate: ${parseFloat(d[svg_3_global_data.selected_cols[1]]).toPrecision(4)}`

	d3.select('#svg-3-tooltip')
		.style('display', 'block')
		.style('left', mouse[0] + 75 + 'px')
		.style('top', mouse[1] - 20 + 'px')
		.style('font-size', '0.7em')
}

function bubble_mouseout() {
	d3.selectAll('.bubbles')
		.style('opacity', 0.6)

	d3.select('#svg-3-tooltip')
		.style('display', 'none')
}

d3.csv('salaries_unemployment.csv').then(function(data) {
	svg_3_global_data['data'] = data
	svg_3_global_data['columns'] = data.columns.slice(3)

	var xScale = d3.scaleLinear()
					.range([0, width_3])
					.domain([0, 100])

	var yScale = d3.scaleLinear()
					.range([height_3, 0])
					.domain([0, 40])

	svg_3_global_data['xScale'] = xScale;
	svg_3_global_data['yScale'] = yScale;

	chart_3.append('g')
		.attr('class', 'yAxis')
		.style('font-size', '0.6rem')
		.call(d3.axisLeft(yScale))

	chart_3.append('g')
		.attr('class', 'xAxis')
		.style('font-size', '0.6rem')
		.attr('transform', `translate(0, ${height_1})`)
		.call(d3.axisBottom(xScale))

	draw_bubbles();

	svg_3.append('text')
		.attr('x', -(height_1/2)-margin_1)
		.attr('y', margin_1/2)
		.attr('class', 'yLabel')
		.attr('transform', 'rotate(-90)')
		.attr('text-anchor', 'middle')
		.attr('font-size', '0.7rem')
		.text('Unemployment Rate (%)')

	svg_3.append('text')
		.attr('x', (width_1/2)+margin_1)
		.attr('y', height_1+margin_1*1.7)
		.attr('class', 'xLabel')
		.attr('text-anchor', 'middle')
		.attr('font-size', '0.7rem')
		.text('Mean Salaries')

	svg_3.append('text')
		.attr('x', (width_1/2)+margin_1)
		.attr('y', margin_1/2)
		.attr('class', 'title')
		.attr('id', 'title-svg-3')
		.attr('text-anchor', 'middle')
		.attr('font-size', '0.8rem')
		.text('Countries Mean Salaries Against Unemployment Rate (%) in Male')
})

// Chenge selection
$('#svg-3-selection').find('input').on('click', function() {
	ori_title = document.querySelector('#title-svg-3').innerHTML.split(' ')
	ori_title.pop()
	ori_title.push(this.parentNode.innerText)
	document.querySelector('#title-svg-3').innerHTML = ori_title.join(' ')

	$(this.parentNode).addClass('active');
	draw_bubbles();
});


for(i=0; i<svg_3_global_data.regions.length; i++) {
	r = svg_3_global_data.regions[i]
	c = document.querySelector('#'+r);
	text = c.parentNode.innerText;
	color = svg_3_global_data.colors[text]
	c.parentNode.style.borderColor = color

	$(c.parentNode).on('mouseover', function() {
		$(this).css('background-color', svg_3_global_data.colors[this.innerText]);
		$(this).css('color', '#ffffff');

		for(i=0;i<svg_3_global_data.regions.length;i++) {
			r = svg_3_global_data.regions[i]
			if(r == this.innerText.toLowerCase().split(' ')[0]) {
				d3.selectAll('.'+r)
					.style('opacity', 1)
			}
			else {
				d3.selectAll('.'+r)
					.style('opacity', 0.2)
			}
		}

	})
	$(c.parentNode).on('mouseout', function() {
		if(!this.classList.contains('svg-3-active')){
			$(this).css('background-color', 'transparent');
			$(this).css('color', '#000000');
			d3.selectAll('.bubbles')
				.style('opacity', 0.6)
			}
	})

	$(c.parentNode).on('click', function() {
		draw_bubbles()
		for(i=0;i<svg_3_global_data.regions.length;i++) {
			r = svg_3_global_data.regions[i]
			region = this.innerText.toLowerCase().split(' ')[0]
			if(r != region) {
				d3.selectAll('.'+r)
					.remove()
			}
		}
	})
}
