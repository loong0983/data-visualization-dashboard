var margin_2 = 35;

var width_2 = document.querySelector('#svg-2').clientWidth - 2 * margin_2;
var height_2 = document.querySelector('#svg-2').clientHeight - 2 * margin_2;

var svg_2 = d3.select('#svg-2');
var chart_2 = svg_2.append('g')
			.attr('transform', `translate(${margin_2*1.2}, ${margin_2*0.8})`);

var svg_2_color = {
  'male': '#007bff',
  'female': '#fd7e14'
}

var svg_2_gender = Object.keys(svg_2_color)

d3.csv('labour_force_only_normalized.csv').then(function(data) {
	var Gender = data.columns.slice(1)

	var Region = d3.map(data, function(d){return(d.Region)}).keys()

	var x = d3.scaleBand()
        		  .domain(Region)
            	.range([0, width_2])
            	.padding([0.1])

  chart_2.append("g")
  	.attr("transform", "translate(0," + height_2 + ")")
    .style('font-size', '0.6rem')
  	.call(d3.axisBottom(x).tickSizeOuter(0))
    .selectAll(".tick text")
    .call(wrap, x.bandwidth());

  var y = d3.scaleLinear()
		.domain([0, 100])
		.range([ height_2, 0 ]);

	chart_2.append("g")
		.call(d3.axisLeft(y));

  var color = d3.scaleOrdinal()
                	.domain(Gender)
                	.range(['#007bff', '#fd7e14'])

  svg_2.append('text')
		.attr('x', (width_2/2)+margin_2)
		.attr('y', margin_2/2)
		.attr('class', 'title')
		.attr('text-anchor', 'middle')
		.attr('font-size', '0.8rem')
		.text('Labour Force Gender Percentage across Different Regions')

  svg_2.append('text')
    .attr('x', -(height_2/2)-margin_2)
    .attr('y', margin_2/2)
    .attr('class', 'yLabel')
    .attr('transform', 'rotate(-90)')
    .attr('text-anchor', 'middle')
    .attr('font-size', '0.7rem')
    .text('Labour Force in Percentage (%)')

	dataNormalized = []
	data.forEach(function(d){
    // Compute the total
    	tot = 0
    	for (i in Gender){ name=Gender[i] ; tot += +d[name] }
    // Now normalize
    	for (i in Gender){ name=Gender[i] ; d[name] = d[name] / tot * 100}
  })

  var stackedData = d3.stack()
    	.keys(Gender)
    	(data)

  var tooltip = d3.select("#svg-2")
  	.append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("padding", "10px")

  var mouseover = function(d) {
    var subgroupName = d3.select(this.parentNode).datum().key;
    var subgroupValue = d.data[subgroupName];
    tooltip
        .html(subgroupName + ":" + "<br>" + "Value: " + subgroupValue)
        .style("opacity", 1)
  }
  var mousemove = function(d) {
    tooltip
      .style("left", (d3.mouse(this)[0]+90) + "px")
      .style("top", (d3.mouse(this)[1]) + "px")
  }
  var mouseleave = function(d) {
    tooltip
      .style("opacity", 0)
  }

	chart_2.append("g")
		.selectAll("g")
    	.data(stackedData)
    	.enter().append("g")
    		.attr("fill", function(d) { return color(d.key); })
    		.selectAll("rect")
    		.data(function(d) { return d; })
    		.enter().append("rect")
          .attr('class', function(d) { return d[0] == 0 ? 'male' : 'female'})
    			.attr("x", function(d) { return x(d.data.Region); })
        	.attr("y", function(d) { return y(d[1]); })
        	.attr("height", function(d) { return y(d[0]) - y(d[1]); })
        	.attr("width",x.bandwidth())
        .on("mouseover", function(d) {
            var mouse = d3.mouse(this)
            document.querySelector('#svg-2-tooltip').innerHTML = `Region: ${d.data.Region}<br>Male: ${parseFloat(d.data.Male).toPrecision(4)}%<br>Female: ${parseFloat(d.data.Female).toPrecision(4)}%`
              d3.select('#svg-2-tooltip')
                .style('display', 'block')
                .style('left', mouse[0] + 75 + 'px')
                .style('top', mouse[1] - 20 + 'px')
                .style('font-size', '0.7em')
        })
      	.on("mouseleave", function(d) {
            d3.select('#svg-2-tooltip')
              .style('display', 'none')
        })
})

// Wrap labels
function wrap(text, width) {
  text.each(function() {
    var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1, // ems
        y = text.attr("y"),
        dy = parseFloat(text.attr("dy")),
        tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
      }
    }
  });
}


for(i=0; i<svg_2_gender.length;i++) {
  gender = svg_2_gender[i]
  el = document.querySelector(`#${gender}`)
  $(el.parentNode).css('border-color', svg_2_color[gender])

  $(el.parentNode).on('mouseover', function() {
    $(this).css('background-color', svg_2_color[this.innerText.toLowerCase()])
    $(this).css('color', '#fff')
    for(i=0; i<svg_2_gender.length;i++) {
      if(this.innerText.toLowerCase() != svg_2_gender[i]) {
        d3.selectAll(`rect.${svg_2_gender[i]}`)
          .style('opacity', 0.2)
      }
    }
  })
  $(el.parentNode).on('mouseout', function() {
    $(this).css('background-color', 'transparent')
    $(this).css('color', '#000')
    d3.selectAll('rect')
      .style('opacity', 1)
  })
}

// Object.keys(svg_2_color).forEach(function(key, idx) {
//   el = document.querySelector(`#${key}`)
//   $(el.parentNode).css('border-color', svg_2_color[key])

//   #(el.parentNode).on('mouseover', function() {
//     d3.selectAll('rect .'+key)
//       .opacity
//   })
// })