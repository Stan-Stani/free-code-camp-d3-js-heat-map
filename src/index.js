
// Define global variables
const WIDTH = 800;
const HEIGHT = 600;
const PADDING = 20;

PLOT_WIDTH = WIDTH - PADDING;
PLOT_HEIGHT = HEIGHT - PADDING;

const xScale = d3.scaleTime();

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
        let itemsPerLine = monthlyVariance.length / 12
        c({itemsPerLine})


        svgWrapper
            .selectAll('rect')
            .data(data.monthlyVariance)
            .enter()
            .append('rect')
            .attr('width', '30')
            .attr('height', '40')
            .attr('x', '10')
            .attr('y', '10')

    })



// utility functions
function c(...input) {
    console.log(...input);
}
