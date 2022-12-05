
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

fetch(
    "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json",
    {method: "GET", header: "Content-Type: application/json"}
)
    .then(res => res.json())
    .then(data => {
        const svgWrapper = d3.select('#svg-wrapper');
        let monthlyVariance = data.monthlyVariance

        let yearsObj = {};
        for (const element of monthlyVariance) {

            yearsObj[element.year] = element.year;
        }
        const yearCount = Object.keys(yearsObj).length;
        const heatMapElementWidth = WIDTH / yearCount;
        
        xScale.domain([monthlyVariance[0].year, monthlyVariance[monthlyVariance.length - 1].year]);

        svgWrapper
            .selectAll('rect')
            .data(data.monthlyVariance)
            .enter()
            .append('rect')
            .attr('width', heatMapElementWidth)
            .attr('height', '40')
            .attr('x', d => xScale(d.year))
            .attr('y', (d) => yScale(d.month))
            .attr('fill', d3.color('steelblue'))

    })



// utility functions
function c(...input) {
    console.log(...input);
}
