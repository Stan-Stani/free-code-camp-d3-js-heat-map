
// Define global variables
const WIDTH = 800;
const HEIGHT = 600;
const PADDING = 20;

PLOT_WIDTH = WIDTH - PADDING;
PLOT_HEIGHT = HEIGHT - PADDING;

const xScale = d3.scaleTime();
xScale.range([PADDING, WIDTH - PADDING])

// input domain and range to yScale
const yScale = d3.scaleLinear([1, 12], [PADDING, PLOT_HEIGHT]);

const svgWrapper = d3.select('#svg-wrapper');



fetch(
    "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json",
    {method: "GET", header: "Content-Type: application/json"}
)
    .then(res => res.json())
    .then(data => {
        
        let monthlyVariance = data.monthlyVariance

        let yearsObj = {};
        for (const element of monthlyVariance) {

            yearsObj[element.year] = element.year;
        }
        const yearCount = Object.keys(yearsObj).length;
        const heatMapElementWidth = WIDTH / yearCount;
        
        xScale.domain([monthlyVariance[0].year, monthlyVariance[monthlyVariance.length - 1].year]);



        let coldestVariance = d3.min(monthlyVariance, element => element.variance);
        let hottestVariance = d3.max(monthlyVariance, element => element.variance);
        c({coldestVariance, hottestVariance})
        // { coldestVariance: -6.976, hottestVariance: 5.228 }
        let justVarianceArr = monthlyVariance.map(element => {
            return element.variance;
        })



        const colorScale = d3.scaleQuantile()
        colorScale.domain(justVarianceArr);
        colorScale.range([
            d3.color('#005f73'),
            d3.color('#0a9396'), 
            d3.color('#94d2bd'), 
            d3.color('#e9d8a6'),
            d3.color('#ee9b00'),
            d3.color('#ca6702'),
            d3.color('#bb3e03'),
            d3.color('#ae2012'),
            d3.color('#9b2226')
        ])

        c(colorScale.quantiles())
        

        svgWrapper
            .selectAll('rect')
            .data(data.monthlyVariance)
            .enter()
            .append('rect')
            .attr('width', heatMapElementWidth)
            .attr('height', '40')
            .attr('x', d => xScale(d.year))
            .attr('y', (d) => yScale(d.month))
            .attr('fill', d => {
                return colorScale(d.variance).formatHex()
            }).on('mouseover', (e, d) => {
                tooltip.select('text')
                .text(JSON.stringify(d))
            })


        tooltip = buildTooltipScaffold();
        tooltip.attr('style', 'transform: translate(0px, 500px);')
    })




    function buildTooltipScaffold() {
        let tooltip = svgWrapper
            .append('g')
            .attr('id', 'tooltip')
        
        let tooltipRect = tooltip
            .append('rect')
            .attr('id', 'tooltip')
            .attr('rx', '.75%')
            .attr('ry', '.75%')
            .attr('width', '400')
            .attr('height', '100')
        
        tooltip
            .append('text')
            .text('hello')
            .attr('x', '0')
            .attr('y', '32')
            

        return tooltip;
    }


// utility functions
function c(...input) {
    console.log(...input);
}
